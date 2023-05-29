import { ChatCompletionRequestMessage, OpenAIApi } from 'openai'
import { z } from 'zod'
import { limitPromptTokenCount } from './utils'

// OpenAI API response schema for chat completions
// Reference: https://platform.openai.com/docs/api-reference/chat/create
const openAICompletionSchema = z.object({
  id: z.string(),
  object: z.string(),
  created: z.number(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.literal('assistant'),
        content: z.string(),
      }),
      finish_reason: z.string(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
})

/**
 * Get new playlist using ChatGPT.
 *
 * Reference: https://platform.openai.com/docs/api-reference/chat/create
 */
export const getPlaylist = async (
  messages: ChatCompletionRequestMessage[],
  openAIApi: OpenAIApi,
  maxPromptTokens: number,
  maxCompletionTokens: number,
  systemMessageContent: string
) => {
  const model = 'gpt-3.5-turbo'
  const truncatedMessages = limitPromptTokenCount(messages, maxPromptTokens, model, systemMessageContent)
  const res = await openAIApi
    .createChatCompletion({
      model,
      messages: truncatedMessages,
      max_tokens: maxCompletionTokens,
    })
    .catch((e) => console.log(e))

  const completion = openAICompletionSchema.parse(res)

  // Log warning if calculated prompt token count differs from prompt token count returned by API
  if (completion.usage.prompt_tokens !== maxPromptTokens) {
    console.warn(
      `Calculated prompt token count (${maxPromptTokens}) differs from prompt token count returned by API (${completion.usage.prompt_tokens})`
    )
  }

  // Return playlist (as completion message)
  return completion.choices[0]?.message
}
