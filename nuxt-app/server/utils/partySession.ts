import kv from '@vercel/kv'
import Pusher from 'pusher'
import { Message, User } from '~/types/partySession'
import { partySessionConfig } from '~/composables/usePartySessionConfig'

const { env } = process
const { events, cacheChannel } = partySessionConfig

/** Server-side helper for Pusher party sessions. */
export class PartySession {
  sessionCode: string
  pusher: Pusher

  /** Create Pusher party session helper. */
  constructor(sessionCode: string) {
    // Init Pusher client (server-side)
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

  /** Get user list from KV store for session code. */
  private getUsers(): Promise<User[] | null> {
    // TODO: Validate using Zod?
    return kv.hget(this.sessionCode, events.users)
  }

  /** Add new user to KV store for session code. */
  public async addUser(user: User) {
    const users = (await this.getUsers()) ?? []
    users.push(user)
    await kv.hset(this.sessionCode, { users })
    // TODO: Too optimistic?
    this.pusher.trigger(cacheChannel(this.sessionCode), events.users, users)
  }

  /** Get message list from KV store for session code.  */
  private getMessages(): Promise<Message[] | null> {
    // TODO: Validate using Zod?
    return kv.hget(this.sessionCode, events.messages)
  }

  /** Add new message to KV store for session code. */
  public async addMessage(message: Message) {
    const messages = (await this.getMessages()) ?? []
    messages.push(message)
    await kv.hset(this.sessionCode, { messages })
    // TODO: Too optimistic?
    this.pusher.trigger(cacheChannel(this.sessionCode), events.messages, messages)
  }
}
