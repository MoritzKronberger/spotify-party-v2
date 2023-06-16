import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import type { H3Event } from 'h3'
import { router } from '../trpc'
import { sessionHostProcedure, sessionProcedure } from '../middleware/isSession'
import { spotifyRouter } from './spotify'
import { partyRouter } from './party'
import { FullMessage, userMessageSchema } from '~/types/partySession'
import { PartySession } from '~/server/utils/partySession'
import { genNanoId } from '~/utils/nanoId'
import { openAIClient } from '~/openaiClient'
import { db } from '~/db'
import { party as partyTable } from '~/db/schema'
import { Party } from '~/types/trpc'
import { getUserDataFromDB } from '~/server/utils/user'
import { signJWT } from '~/server/auth'

/**
 * Update playlist using OPenAI-API and Spotify-API.
 *
 * - Prompt ChatGPT for new playlist using session Messages.
 * - Add prompt-result message to session messages (for later context)
 * - Update the party's token count
 * - Update the party playlist with the new tracks
 */
const updatePlaylist = async (sessionMessages: FullMessage[], party: Party, event: H3Event): Promise<void> => {
  console.log('Updating playlist...')

  const { playlistId } = party

  // Create new tRPC context
  const user = await getUserDataFromDB({ userId: party.userId })
  // Abort if party host not found in users
  // TODO: Throw error?
  if (!user) return
  // Sign new JWT to allow Backend to pose as user
  // TODO: Security risk?
  const ctx = { party, event, user, credentials: { jwt: signJWT(user) } }
  // Create new party session helper
  const partySession = new PartySession(party.code)

  // Prompt new playlist
  const promptMessages = partySession.publicFormatPromptMessages(sessionMessages)
  const result = await openAIClient.promptPlaylist(promptMessages)
  if (!result) return
  const { totalTokens, playlist } = result

  // Increase party token count
  await db
    .update(partyTable)
    .set({ tokenCount: party.tokenCount + totalTokens })
    .where(eq(partyTable.id, party.id))

  if (playlist) {
    // Add assistant message (playlist) to messages for later context
    await partySession.addMessage(playlist)

    // Parse playlist and get song queries
    const songQueries = openAIClient.parsePlaylist(playlist.content)

    // Create tRPC server-side caller for Spotify procedures
    const spotify = spotifyRouter.createCaller(ctx)

    // Get Spotify song-URIs for song queries
    const trackURIs = await spotify.searchTracks(songQueries)

    // Update playlist with new tracks
    await spotify.updatePlaylistTracks({ playlistId, trackURIs })

    // Publish new playlist
    // Publish without data, since size of playlist data regularly exceeds Pusher's maximum playlist size (let clients fetch playlist themselves)
    partySession.publishPlaylist()
  }
}

export const sessionRouter = router({
  /** Start live party session. */
  startSession: sessionHostProcedure.mutation(async ({ ctx }) => {
    const { party, partySession } = ctx

    // If the host is joining the party for the first time
    // (-> activating it)
    // Create the initial playlist using all current messages
    if (party.sessionStatus === 'inactive') {
      const messages = await partySession.getMessages()
      if (messages) await updatePlaylist(messages, party, ctx.event)
    }

    // Start playback of party playlist on the host's device
    const spotify = spotifyRouter.createCaller(ctx)
    await spotify.setPlaylistPlayback({ playlistId: party.playlistId })

    // Set session status as "active" in DB
    const partyProcedures = partyRouter.createCaller(ctx)
    const status = 'active'
    await partyProcedures.setSessionStatus({ id: party.id, status })

    // Publish new status
    await partySession.publishStatus(status)
  }),
  /** End live party session. */
  stopSession: sessionHostProcedure.mutation(async ({ ctx }) => {
    const { party, partySession } = ctx
    const partyProcedures = partyRouter.createCaller(ctx)
    const status = 'closed'
    await partySession.publishStatus(status)
    return await partyProcedures.setSessionStatus({ id: party.id, status })
  }),
  /** Add message to party session. */
  addMessage: sessionProcedure
    .input(z.object({ message: userMessageSchema.omit({ id: true }) }))
    .mutation(async ({ input, ctx }) => {
      // Throw if maximum token count has already been reached
      if (ctx.party.tokenCount >= openAIClient.maxPartyTokens)
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Maximum token count has been reached' })

      // Unpack inputs
      const { message } = input
      // Create new party session helper
      const { party, partySession } = ctx

      // Format and publish message

      // Format message for OpenAI chat API
      const fullMessage = partySession.formatUserMessage({ ...message, id: genNanoId() }, 'user')
      // Add message to party session
      const sessionMessages = await partySession.addMessage(fullMessage)
      // Publish new message list (optimistic update)
      partySession.publishMessages(sessionMessages)

      // Update playlist using OpenAI-API and Spotify-API

      // Update playlist every #promptMessageBuffer user-messages
      // Only if party is active!
      if (party.sessionStatus === 'active') {
        const userMessages = sessionMessages.filter((message) => message.role === 'user')
        if (userMessages.length % openAIClient.opts.promptMessageBuffer === 0)
          await updatePlaylist(sessionMessages, ctx.party, ctx.event)
      }
    }),
  /** Get all user messages for party session. */
  getMessages: sessionProcedure.query(async ({ ctx }) => {
    const { partySession } = ctx
    const messages = (await partySession.getMessages()) ?? []
    return partySession.parseFullMessagesForUsers(messages)
  }),
  /**
   * Allow hosts to publish the current playback state.
   *
   * (Only for active party and only if party playlist is being played.)
   *
   * Interval to call this function must be run client-side,
   * sine intervals > 60s would cause Vercel Serverless Functions to timeout.
   *
   * Reference:
   * https://vercel.com/docs/concepts/functions/serverless-functions#execution-timeout
   */
  publishPlayback: sessionHostProcedure.query(async ({ ctx }) => {
    const { party, partySession } = ctx
    const spotify = spotifyRouter.createCaller(ctx)

    // Do nothing (also ends interval) for inactive party
    if (party.sessionStatus === 'active') {
      const playback = await spotify.getPlayback({ playlistId: party.playlistId })
      await partySession.publishPlayback(playback)
      return playback
    }
  }),
})
