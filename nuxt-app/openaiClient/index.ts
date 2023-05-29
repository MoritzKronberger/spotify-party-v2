import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { getPlaylist } from './chat'

const { env } = process

// Configure OpenAI API
// Reference: https://platform.openai.com/docs/api-reference/requesting-organization
const configuration = new Configuration({
  organization: env.OPENAI_ORGANIZATION,
  apiKey: env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export const openAIClient = {
  systemMessage:
    'You are the perfect party DJ, all following messages are feedback for a playlist. You will only respond in the following JSON-Format: [{name: sting, artist: string}]',
  getPlaylist: (messages: ChatCompletionRequestMessage[], systemMessageContent?: string) =>
    getPlaylist(
      messages,
      openai,
      parseInt(env.OPENAI_MAX_PROMPT_TOKENS ?? '100'),
      parseInt(env.OPENAI_MAX_COMPLETION_TOKENS ?? '50'),
      systemMessageContent ?? openAIClient.systemMessage
    ),
}
