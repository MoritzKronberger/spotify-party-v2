import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { parsePlaylist, promptPlaylist } from './promptPlaylist'
import { getTokenTargets } from './utils'

const { env } = process

export type Model = 'gpt-3.5-turbo' | 'gpt-4'

export type SystemMessage = {
  content: string
  role: 'system'
}

export type PlaylistParsing = {
  playlistSeparator: string
  csvSeparator: string
}

const playlistParsing: PlaylistParsing = {
  playlistSeparator: '$PLAYLIST$',
  csvSeparator: ';',
}

export type OpenAIClientOpts = {
  max$PerParty: number
  $per1KTokens: number
  partyMessagesTarget: number
  promptMessageTrunc: number
  promptMessageBuffer: number
  playlistTokenSplit: number
  model: Model
  systemMessage: SystemMessage
}

// Custom OpenAI client options
const opts: OpenAIClientOpts = {
  max$PerParty: +(env.OPENAI_MAX_DOLLARS_PER_PARTY ?? 0.15),
  $per1KTokens: +(env.OPENAI_DOLLARS_PER_1K_TOKENS ?? 0.002),
  partyMessagesTarget: +(env.OPENAI_PARTY_MESSAGES_TARGET ?? 150),
  promptMessageTrunc: +(env.OPENAI_PROMPT_MESSAGE_TRUNC ?? 10),
  promptMessageBuffer: +(env.OPENAI_PROMPT_MESSAGE_BUFFER ?? 5),
  playlistTokenSplit: +(env.OPENAI_PLAYLIST_TOKEN_SPLIT ?? 0.75),
  model: 'gpt-3.5-turbo',
  systemMessage: {
    role: 'system',
    content: `
    You are now a playlist generating API.

    Your job is to create a single, continuously evolving playlist, that incorporates all music requests and feedback.
    All following messages are music requests or feedback on the current playlist or the playlist's vibe.

    As a playlist-API you can only respond in the CSV-response-format.
    The CSV-Response-Format contains no other content than a single(!) playlist in the following CSV-Format:

    ${playlistParsing.playlistSeparator}
    ${new Array(5)
      .fill(0)
      .map((_, i) => `song${i + 1} artist${i + 1}`)
      .join(playlistParsing.csvSeparator)}
    ${playlistParsing.playlistSeparator}

    As the API return NOTHING BUT A SINGLE PLAYLIST containing at least 10 songs CSV-response-format.
    As the API the single playlist should incorporate all the current music requests and feedback.
    As the API you can't use line breaks.
    As the API you can't write an initial sentence.
    `,
  },
}

// Calculate targeted token count for messages and playlists
const maxTokenOpts = getTokenTargets(opts)

// Configure OpenAI API
// Reference: https://platform.openai.com/docs/api-reference/requesting-organization
const configuration = new Configuration({
  organization: env.OPENAI_ORGANIZATION,
  apiKey: env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

/**
 * Helper for interacting with OpenAI-API:
 * - Prompt for new playlist
 * - Parse playlist prompt result
 * - Access token constraints
 */
export const openAIClient = {
  opts,
  promptPlaylist: (messages: ChatCompletionRequestMessage[]) => promptPlaylist(messages, openai, opts, maxTokenOpts),
  parsePlaylist: (completion: string) => parsePlaylist(completion, playlistParsing),
  tokenTargets: getTokenTargets(opts),
  ...maxTokenOpts,
}
