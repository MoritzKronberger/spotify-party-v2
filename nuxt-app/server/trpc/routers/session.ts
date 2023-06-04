import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { router } from '../trpc'
import { sessionProcedure } from '../middleware/isSession'
import { userMessageSchema } from '~/types/partySession'
import { PartySession } from '~/server/utils/partySession'
import { genNanoId } from '~~/utils/nanoId'
import { openAIClient } from '~/openaiClient'
import { db } from '~/db'
import { party } from '~/db/schema'

export const sessionRouter = router({
  /** Add message to party session. */
  addMessage: sessionProcedure
    .input(z.object({ message: userMessageSchema.omit({ id: true }) }))
    .mutation(async ({ input, ctx }) => {
      // Throw if maximum token count has already been reached
      if (ctx.party.tokenCount >= openAIClient.maxPartyTokens)
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Maximum token count has been reached' })

      // Unpack inputs
      const { session, message } = input
      // Create new party session helper
      const partySession = new PartySession(session.sessionCode)

      // Format and publish message

      // Format message for OpenAI chat API
      const fullMessage = partySession.formatUserMessage({ ...message, id: genNanoId() }, 'user')
      // Add message to party session
      const sessionMessages = await partySession.addMessage(fullMessage)
      // Publish new message list (optimistic update)
      partySession.publishMessages(sessionMessages)

      // Prompt playlist using OpenAI-API

      // For every promptMessageBuffer user messages prompt for new playlist
      const userMessages = sessionMessages.filter((message) => message.role === 'user')
      if (userMessages.length % openAIClient.opts.promptMessageBuffer === 0) {
        // Prompt new playlist
        const promptMessages = partySession.publicFormatPromptMessages(sessionMessages)
        const result = await openAIClient.getPlaylist(promptMessages)
        if (!result) return
        const { totalTokens, playlist } = result
        // Increase party token count
        await db
          .update(party)
          .set({ tokenCount: ctx.party.tokenCount + totalTokens })
          .where(eq(party.id, ctx.party.id))
        // Add assistant message (playlist) to messages for later context
        if (playlist) await partySession.addMessage(playlist)
        // TODO: parse playlist
        console.log(playlist, ctx.party.tokenCount, totalTokens)
      }
    }),
})
