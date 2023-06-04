import { ChatCompletionRequestMessage } from 'openai'
import { get_encoding as getEncoding, encoding_for_model as encodingForModel, Tiktoken } from '@dqbd/tiktoken'
import { Model, OpenAIClientOpts } from '.'

export type MaxTokenOpts = {
  maxPartyTokens: number
  maxMessageTokens: number
  maxPlaylistTokens: number
}

/**
 * Get number of used tokens used by message for given model.
 *
 * References:
 * - https://github.com/dqbd/tiktoken#usage
 * - https://platform.openai.com/docs/guides/chat/managing-tokens
 */
export const getMessageTokenCount = (message: ChatCompletionRequestMessage, model: Model) => {
  // Set encoding for model
  let encoding: Tiktoken
  try {
    encoding = encodingForModel(model)
  } catch {
    // Use fallback encoding for invalid model name
    encoding = getEncoding('cl100k_base')
  }
  // Calculate number of tokens for message
  let numTokens = 4 // every message follows <im_start>{role/name}\n{content}<im_end>\n
  Object.entries(message).forEach(([key, value]) => {
    numTokens += encoding.encode(value).length
    if (key === 'name') numTokens -= 1 // if there's a name, the role (1 token) is omitted
  })
  return numTokens
}

/** Calculate maximum number of tokens to use for messages and playlists. */
export const getTokenTargets = (opts: OpenAIClientOpts): MaxTokenOpts => {
  const {
    max$PerParty,
    $per1KTokens,
    partyMessagesTarget,
    promptMessageBuffer,
    promptMessageTrunc,
    playlistTokenSplit,
    model,
    systemMessage,
  } = opts

  // Number of tokens used by system message
  const systemMessageTokens = getMessageTokenCount(systemMessage, model)
  // A new prompt will be sent every promptMessageBuffer messages
  const totalPromptCount = partyMessagesTarget / promptMessageBuffer
  // Maximum number of tokens that fits budget
  const maxPartyTokens = (max$PerParty / $per1KTokens) * 1_000
  // Tokens that can actually be used for messages and playlists
  const maxUseableTokens = maxPartyTokens - totalPromptCount * systemMessageTokens
  // Calculate how many of the total tokens to use for playlists and how many to use for messages
  const totalPlaylistTokens = maxUseableTokens * playlistTokenSplit
  const totalMessageTokens = maxUseableTokens * (1 - playlistTokenSplit)
  // Maximum number of tokens for a single message
  // For every playlist promptMessageBuffer (new messages) + promptMessageTrunc (old messages for context) messages will be sent
  const maxMessageTokens = Math.floor(
    totalMessageTokens / (totalPromptCount * (promptMessageBuffer + promptMessageTrunc))
  )
  // Number of tokens to use for playlists
  // Two playlists will be sent/received for every prompt (old playlist for context & new playlist)
  const maxPlaylistTokens = Math.floor(totalPlaylistTokens / (totalPromptCount * 2))

  return {
    maxPartyTokens,
    maxMessageTokens,
    maxPlaylistTokens,
  }
}

/**
 * Compose playlist prompt from entire message log.
 *
 * - System message
 * - Old user messages (truncated) for context
 * - Last assistant message (playlist) for context
 * - New assistant messages (buffer)
 */
export const composePlaylistPrompt = (
  messages: ChatCompletionRequestMessage[],
  opts: OpenAIClientOpts
): ChatCompletionRequestMessage[] => {
  const { promptMessageBuffer, promptMessageTrunc, systemMessage } = opts
  // Separate assistant and user messages
  const assistantMessages = messages.filter((message) => message.role === 'assistant')
  const userMessages = messages.filter((message) => message.role === 'user')
  // Get last assistant message (if exists)
  const oldAssistantMessage = assistantMessages.at(-1)
  // Current user message stack [irrelevant messages, old messages (trunc), new messages (buffer)]
  // Get old and new user messages
  const userMessageBufferStartIdx = userMessages.length - 1 - promptMessageBuffer
  const userMessageTruncStartIdx = userMessages.length - 1 - (promptMessageTrunc + promptMessageBuffer)
  const newUserMessages = userMessages.slice(userMessageBufferStartIdx)
  const oldUserMessages = userMessages.slice(userMessageTruncStartIdx, userMessageBufferStartIdx)
  // Compose full playlist query
  return [systemMessage, ...oldUserMessages, ...(oldAssistantMessage ? [oldAssistantMessage] : []), ...newUserMessages]
}

/**
 * Limit user and assistant messages to their maximum token count.
 *
 * - Reduce `content` length by `stepSize` until valid token count is reached
 * - Only meant for messages which are already very close to desired token count!
 */
export const limitPromptMessageTokens = (
  messages: ChatCompletionRequestMessage[],
  model: Model,
  maxTokenOpts: MaxTokenOpts,
  stepSize = 5
): ChatCompletionRequestMessage[] => {
  const { maxMessageTokens, maxPlaylistTokens } = maxTokenOpts
  return messages.map((message) => {
    const { content, role } = message
    // Leave system message as is
    if (role === 'system') return message
    // Determine which max token count to use
    const maxTokens = role === 'assistant' ? maxPlaylistTokens : maxMessageTokens
    // Determine current token count
    let tokenCount = getMessageTokenCount(message, model)
    // Reduce content length until valid token count is reached
    while (tokenCount > maxTokens) {
      const endIdx = message.content.length - 1 - stepSize
      if (endIdx <= 0) {
        throw new Error(`Cannot reach token limit ${maxTokens} by shortening content.`)
      }
      message.content = content.substring(0, endIdx)
      tokenCount = getMessageTokenCount(message, model)
    }

    return message
  })
}
