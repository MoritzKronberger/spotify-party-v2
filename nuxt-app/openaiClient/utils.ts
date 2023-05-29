import { ChatCompletionRequestMessage } from 'openai'
import { get_encoding as getEncoding, encoding_for_model as encodingForModel, Tiktoken } from '@dqbd/tiktoken'

/**
 * Limit number of tokens used by prompt (messages) for the given OpenAI chat model.
 *
 * If messages exceed max token count oldest messages (first in array) are omitted.
 * System message is always included.
 *
 * References:
 * - https://github.com/dqbd/tiktoken#usage
 * - https://platform.openai.com/docs/guides/chat/managing-tokens
 */
export const limitPromptTokenCount = (
  messages: ChatCompletionRequestMessage[],
  maxTokens: number,
  model: 'gpt-3.5-turbo' | 'gpt-4',
  systemMessageContent: string
) => {
  let encoding: Tiktoken
  try {
    encoding = encodingForModel(model)
  } catch {
    // Use fallback encoding for invalid model name
    encoding = getEncoding('cl100k_base')
  }

  // Reverse messages array (newest messages first)
  const messagesTimeDesc = messages.reverse()
  console.log(messagesTimeDesc)

  // Calculate number of tokens for each message
  const messageTokens = messagesTimeDesc.map((message) => {
    let numTokens = 4 // every message follows <im_start>{role/name}\n{content}<im_end>\n
    Object.entries(message).forEach(([key, value]) => {
      numTokens += encoding.encode(value).length
      if (key === 'name') numTokens -= 1 // if there's a name, the role (1 token) is omitted
    })
    return numTokens
  })

  // Get sum of all message tokens
  const totalMessageTokens = messageTokens.reduce((acc, cur) => acc + cur, 0)
  console.log(totalMessageTokens)

  if (totalMessageTokens <= maxTokens) {
    // Do nothing if messages are below the token limit
    return messages
  } else {
    const systemMessageTokens = 4 + encoding.encode(systemMessageContent).length
    let tokenCount = systemMessageTokens // Offset token count by new system message
    // Discard all messages for which the accumulated token count exceeds the maximum number of tokens
    const truncatedMessagesTimeDesc = messagesTimeDesc.filter((message, i) => {
      tokenCount += messageTokens[i] ?? 0
      return tokenCount <= maxTokens
    })
    // Re-add system message
    truncatedMessagesTimeDesc.push({ role: 'system', content: systemMessageContent })
    // Return truncated messages in original order (oldest first)
    return truncatedMessagesTimeDesc.reverse()
  }
}
