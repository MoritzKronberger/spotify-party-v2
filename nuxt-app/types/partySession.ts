import { ChatCompletionRequestMessage } from 'openai'
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

/** Message as it is returned to users. */
export const userMessageSchema = z.object({
  id: nanoId(),
  content: z.string(),
  member: memberSchema,
})

export type Member = z.infer<typeof memberSchema>
/** Message as it is returned to users. */
export type UserMessage = z.infer<typeof userMessageSchema>

// Full message type
type NonUserChatCompletionRequestMessage = ChatCompletionRequestMessage & { role: 'system' | 'assistant' }
type UserChatCompletionRequestMessage = ChatCompletionRequestMessage & { role: 'user' }
export type FullUserMessage = UserMessage & UserChatCompletionRequestMessage
/** Full message with both, user and OpenAI chat message content. */
export type FullMessage = FullUserMessage | NonUserChatCompletionRequestMessage

/**
 * User data for Pusher presence channel.
 *
 * Reference: https://pusher.com/docs/channels/server%5Fapi/authenticating-users/#user-authentication
 */
export type PresenceData = {
  user_id: string
  user_info: { userName: string; isHost: boolean }
}
