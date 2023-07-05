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

    Your job as the API is to:
    - Create a single, continuously evolving playlist!
    - Incorporate all music requests and feedback into the playlist.
    - Ensure that the generated playlist contains at least 10 songs!
    - No leading sentence is included in your response!

    As a playlist-API you must abide by the CSV-response-format.
    The CSV-Response-Format contains no other content than a single(!) playlist in the following format:

    ${playlistParsing.playlistSeparator}
    ${new Array(5)
      .fill(0)
      .map((_, i) => `song${i + 1} artist${i + 1}`)
      .join(playlistParsing.csvSeparator)}
    ${playlistParsing.playlistSeparator}

    All following messages will be music requests or feedback on the current playlist or the playlist's vibe.
    Please return the ENTIRE PLAYLIST containing AT LEAST 10 SONGS in the CSV-RESPONSE-FORMAT!
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
