import { z } from 'zod'
import { appRouter } from '../trpc/routers'
import { getCredentials } from '../utils/credentials'
import { partySessionConfig } from '~/utils/partySession'
import { PartySession } from '~/server/utils/partySession'
import { PresenceData } from '~/types/partySession'

const pusherAuthSchema = z.object({
  socket_id: z.string(),
  channel_name: z.string(),
})

/**
 * Handle pusher authentication.
 *
 * Authorizes all users for all channels!
 *
 * No authentication check (other than via the random channel id)!
 * Only used as user-tracker, not to grant any privileges!
 *
 * Reference:
 * https://pusher.com/docs/channels/server%5Fapi/authenticating-users/#user-authentication
 */
export default defineEventHandler(async (event) => {
  // Get Pusher data from request body
  const body = await readBody(event)
  const { socket_id: socketId, channel_name: channel } = pusherAuthSchema.parse(body)

  // Get credentials from request cookies (for host)
  const credentials = getCredentials(event)
  const existsCredentials = Object.keys(credentials).length > 0

  // Ensure that channel name corresponds to valid party code
  // Remove prefix from string
  const partyCode = channel.replace(partySessionConfig.presenceCacheChannelPrefix, '')

  // Make server-side calls to tRPC endpoint
  // Reference: https://trpc-nuxt.vercel.app/get-started/tips/server-side-calls
  const tRPCCaller = appRouter.createCaller({ credentials, event })

  const party = (await tRPCCaller.party.getPartyByCode({ code: partyCode }))[0]

  if (!party) {
    throw createError({
      statusCode: 403, // use 403 for Pusher convention
      message: 'Party not found',
    })
  }

  // Check if current user is party host
  let isHost = false
  if (existsCredentials) {
    // Ignore auth-Errors -> user simply won't be host
    try {
      const { id: userId } = await tRPCCaller.auth.getUser()
      isHost = userId === party.userId
    } catch {}
  }

  // Get username and optional user Id (for existing session members) from request query params
  // TODO: Only allow unique usernames?
  const query = getQuery(event)
  const userName = query.user_name?.toString()
  const userId = query.user_id?.toString()

  if (!userName) {
    throw createError({
      statusCode: 403, // use 403 for Pusher convention
      message: 'No username provided',
    })
  }

  if (!userId) {
    throw createError({
      statusCode: 403, // use 403 for Pusher convention
      message: 'No user Id provided',
    })
  }

  // Create user data
  const prescenceData: PresenceData = {
    user_id: userId,
    user_info: {
      userName,
      isHost,
    },
  }

  // Authorize user for requested channel
  const session = new PartySession('')
  return session.authorizeUser(socketId, channel, prescenceData)
})
