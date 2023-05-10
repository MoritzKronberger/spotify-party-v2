import { z } from 'zod'
import { genNanoId } from '~/utils/nanoId'
import { PartySession } from '~/server/utils/partySession'
import { PresenceData } from '~/types/partySession'

const pusherAuthSchema = z.object({
  socket_id: z.string(),
  channel_name: z.string(),
})

/**
 * Authorizes all users for all channels.
 *
 * No authentication check (other than via the random channel id)!
 * Only used as user-tracker, not to grant any privileges!
 */
export default defineEventHandler(async (event) => {
  // Get Pusher data from request body
  const body = await readBody(event)
  const { socket_id: socketId, channel_name: channel } = pusherAuthSchema.parse(body)

  // TODO: Ensure that channel name corresponds to valid party code

  // Get username from request query params
  // TODO: Only allow unique usernames?
  const query = getQuery(event)
  const userName = query.name?.toString()

  if (!userName) {
    throw createError({
      statusCode: 400,
      message: 'No username provided',
    })
  }

  // Create user data
  const prescenceData: PresenceData = {
    user_id: genNanoId(),
    user_info: {
      userName,
    },
  }

  // Authorize user for requested channel
  const session = new PartySession('')
  return session.authorizeUser(socketId, channel, prescenceData)
})
