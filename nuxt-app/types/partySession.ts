import { z } from 'zod'
import { nanoId } from '~/utils/nanoId/zod'

/** Application-wide length for party code. */
export const partyCodeLength = 6
/** Zod schema for party code. (Uppercase NanoID, length 6) */
export const partyCodeSchema = nanoId(partyCodeLength, /^[A-Z0-9]+$/)

export const memberSchema = z.object({
  id: nanoId(),
  name: z.string(),
  isHost: z.boolean(),
})

export const messageSchema = z.object({
  id: nanoId(),
  content: z.string(),
  member: memberSchema,
})

export type Member = z.infer<typeof memberSchema>
export type Message = z.infer<typeof messageSchema>

/**
 * User data for Pusher presence channel.
 *
 * Reference: https://pusher.com/docs/channels/server%5Fapi/authenticating-users/#user-authentication
 */
export type PresenceData = {
  user_id: string
  user_info: { userName: string; isHost: boolean }
}
