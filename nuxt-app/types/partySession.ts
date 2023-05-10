import { z } from 'zod'
import { nanoId } from '~/utils/nanoId/zod'

/** Application-wide length for party code. */
export const partyCodeLength = 6
/** Zod schema for party code. */
export const partyCodeSchema = nanoId(partyCodeLength)

export const userSchema = z.object({
  id: nanoId(),
  name: z.string(),
})

export const messageSchema = z.object({
  content: z.string(),
  user: userSchema,
})

export type User = z.infer<typeof userSchema>
export type Message = z.infer<typeof messageSchema>
