import { ChatCompletionRequestMessage, OpenAIApi } from 'openai'
import { z } from 'zod'
import { MaxTokenOpts, composePlaylistPrompt, getMessageTokenCount, limitPromptMessageTokens } from './utils'
import { OpenAIClientOpts } from '.'

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
  opts: OpenAIClientOpts,
  maxTokenOpts: MaxTokenOpts
) => {
  const { model } = opts
  const { maxPlaylistTokens } = maxTokenOpts
  // Compose prompt messages
  const promptMessages = composePlaylistPrompt(messages, opts)
  const limitedPromptMessages = limitPromptMessageTokens(promptMessages, model, maxTokenOpts)
  // Estimate tokens used by prompt
  const estimatedTokenCount = limitedPromptMessages
    .map((message) => getMessageTokenCount(message, model))
    .reduce((a, b) => a + b)
  // Make prompt using OpenAI-API
  const res = await openAIApi.createChatCompletion({
    model,
    messages: limitedPromptMessages,
    max_tokens: maxPlaylistTokens,
  })
  if (!res) return
  // Validate API-Response
  const completion = openAICompletionSchema.parse(res.data)
  // Get actual used token amounts
  const { total_tokens: totalTokens, prompt_tokens: promptTokens } = completion.usage
  // Log warning if calculated prompt token count differs from prompt token count returned by API
  if (Math.abs(promptTokens - estimatedTokenCount) > 0) {
    console.warn(
      `Calculated prompt token count (${estimatedTokenCount}) differs from prompt token count returned by API (${promptTokens})`
    )
  }
  // Return used tokens and playlist (as completion message)
  return { totalTokens, playlist: completion.choices[0]?.message }
}
