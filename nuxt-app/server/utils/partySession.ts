import kv from '@vercel/kv'
import Pusher from 'pusher'
import { Message, PresenceData } from '~/types/partySession'
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

  /**
   * Get message list from KV store for session code.
   *
   * Reference: https://vercel.com/docs/storage/vercel-kv/kv-reference#hset
   */
  private getMessages(): Promise<Message[] | null> {
    // TODO: Validate using Zod?
    return kv.hget(this.sessionCode, events.messages)
  }

  /**
   * Add new message to KV store for session code and publish message event.
   *
   * References:
   * - https://vercel.com/docs/storage/vercel-kv/kv-reference#hget
   * - https://github.com/pusher/pusher-http-node#publishing-events
   */
  public async addMessage(message: Message) {
    const messages = (await this.getMessages()) ?? []
    messages.push(message)
    await kv.hset(this.sessionCode, { messages })
    // TODO: Too optimistic?
    // Await trigger, otherwise it will not be executed when deployed
    // Reference: https://github.com/vercel/next.js/discussions/48433#discussioncomment-5710270
    await this.pusher.trigger(presenceCacheChannel(this.sessionCode), events.messages, messages)
  }
}