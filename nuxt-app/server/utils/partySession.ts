import kv from '@vercel/kv'
import { ChatCompletionRequestMessage } from 'openai'
import Pusher from 'pusher'
import { UserMessage, PresenceData, FullMessage, FullUserMessage } from '~/types/partySession'
import { partySessionConfig } from '~/utils/partySession'

const { env } = process
const { events, presenceCacheChannel } = partySessionConfig

/** Server-side helper for Pusher party sessions. */
export class PartySession {
  sessionCode: string
  pusher: Pusher

  /** Create Pusher party session helper. */
  constructor(sessionCode: string) {
    // Init Pusher client (server-side)
    // Reference: https://github.com/pusher/pusher-http-node#configuration
    const { PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = env
    if (!PUSHER_APP_ID || !PUSHER_KEY || !PUSHER_SECRET || !PUSHER_CLUSTER) {
      throw new Error('Missing Pusher environment variables')
    }
    this.pusher = new Pusher({
      appId: PUSHER_APP_ID,
      key: PUSHER_KEY,
      secret: PUSHER_SECRET,
      cluster: PUSHER_CLUSTER,
    })
    // Set session code
    this.sessionCode = sessionCode
  }

  /**
   * Authorizes all users for all channels.
   *
   * No authentication check (other than via the random channel id)!
   * Only used as user tracker, not to grant any privileges!
   *
   * Reference: https://github.com/pusher/pusher-http-node#authenticating-users
   */
  public authorizeUser(socketId: string, channel: string, presenceData: PresenceData) {
    return this.pusher.authorizeChannel(socketId, channel, presenceData)
  }

  /** Format regular message to match full message format (including OpenAI chat message content). */
  public formatUserMessage(message: UserMessage, role: 'user' | 'system'): FullMessage {
    return { ...message, role }
  }

  /** Format full message for OpenAI chat API (only keep content and role). */
  publicFormatPromptMessages(messages: FullMessage[]): ChatCompletionRequestMessage[] {
    return messages.map(({ content, role }) => ({ content, role }))
  }

  /**
   * Parse full messages to be returned to users.
   *
   * Exclude system and assistant messages.
   */
  public parseFullMessagesForUsers(messages: FullMessage[]): UserMessage[] {
    const userMessages = messages.filter((message) => message.role === 'user') as FullUserMessage[]
    return userMessages.map(({ role, name, ...message }) => message)
  }

  /**
   * Get message list from KV store for session code.
   *
   * Reference: https://vercel.com/docs/storage/vercel-kv/kv-reference#hset
   */
  public getMessages(): Promise<FullMessage[] | null> {
    // TODO: Validate using Zod?
    return kv.hget(this.sessionCode, events.messages)
  }

  /**
   * Add new message to KV store for session code and return new message list.
   *
   * Reference:
   * - https://vercel.com/docs/storage/vercel-kv/kv-reference#hget
   */
  public async addMessage(message: FullMessage) {
    const messages = (await this.getMessages()) ?? []
    messages.push(message)
    await kv.hset(this.sessionCode, { messages })
    // TODO: Too optimistic?
    return messages
  }

  /**
   * Publish session messages to Pusher channel.
   *
   * Reference:
   * - https://github.com/pusher/pusher-http-node#publishing-events
   */
  public async publishMessages(messages?: FullMessage[]) {
    // Get messages from KV storage if none were provided
    if (!messages) messages = (await this.getMessages()) ?? []
    // Parse messages to be received by users
    const userMessages = this.parseFullMessagesForUsers(messages)
    // Await trigger, otherwise it will not be executed when deployed
    // Reference: https://github.com/vercel/next.js/discussions/48433#discussioncomment-5710270
    return await this.pusher.trigger(presenceCacheChannel(this.sessionCode), events.messages, userMessages)
  }
}
