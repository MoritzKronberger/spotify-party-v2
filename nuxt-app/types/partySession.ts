import { z } from 'zod'
import { nanoId } from '~/utils/nanoId/zod'

/** Application-wide length for party code. */
export const partyCodeLength = 6
/** Zod schema for party code. */
export const partyCodeSchema = nanoId(partyCodeLength, /^[A-Z0-9]+$/)

export const memberSchema = z.object({
  id: nanoId(),
  name: z.string(),
})

export const messageSchema = z.object({
  content: z.string(),
  member: memberSchema,
})

export type Member = z.infer<typeof memberSchema>
export type Message = z.infer<typeof messageSchema>

export type PresenceData = {
  user_id: string
  user_info: { userName: string }
}
