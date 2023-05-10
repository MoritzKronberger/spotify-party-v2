import Pusher, { Channel } from 'pusher-js'
import { Message, Member, PresenceData, partyCodeSchema } from '~/types/partySession'

/** Global config for party session Pusher. */
export const partySessionConfig = {
  events: {
    pusher: {
      subscribeSuccess: 'pusher:subscription_succeeded',
      memberAdded: 'pusher:member_added',
      memberRemoved: 'pusher:member_removed',
    },
    messages: 'messages',
  },
  authEndpoint: (username: string) => `/api/pusher_auth?name=${username}`,
  presenceCacheChannelPrefix: 'presence-cache-',
  presenceCacheChannel: (channelName: string) => `${partySessionConfig.presenceCacheChannelPrefix}${channelName}`,
}

const { events, authEndpoint, presenceCacheChannel } = partySessionConfig

type PusherMembers = {
  [id: string]: PresenceData['user_info']
}

type PusherMe = {
  id: string
  info: PresenceData['user_info']
}

export type PusherMemberData = {
  members: PusherMembers | null
  me: PusherMe | null
}

/** Client-side helper for Pusher party sessions. */
export class PartySession {
  sessionCode: string
  username: string
  pusher: Pusher
  partyChannel: Channel

  /**
   * Create new client-side helper for Pusher party session.
   *
   * Validates session code and subscribes to Pusher channel.
   */
  constructor(sessionCode: string, username: string) {
    // Validate session code
    const uppercaseCode = partyCodeSchema.parse(sessionCode.toUpperCase())
    // Set the session code and username
    this.sessionCode = uppercaseCode
    this.username = username

    // Initialize the pusher client
    const publicVars = useRuntimeConfig().public
    this.pusher = new Pusher(publicVars.PUSHER_KEY, {
      cluster: publicVars.PUSHER_CLUSTER,
      channelAuthorization: {
        endpoint: authEndpoint(username),
        transport: 'ajax',
      },
    })

    // Subscribe to the party session channel
    this.partyChannel = this.pusher.subscribe(presenceCacheChannel(sessionCode))
  }

  /** Set callback for new messages on the party session channel. */
  public onMessage(callback: (messages: Message[]) => void) {
    this.partyChannel.bind(events.messages, callback)
  }

  /** Get me property from channel members. */
  private getMe(): Member {
    const defaultMe = {
      id: '',
      name: this.username,
    }
    if ('members' in this.partyChannel && 'members' in (this.partyChannel.members as PusherMemberData)) {
      const me = (this.partyChannel.members as PusherMemberData).me
      if (!me) return defaultMe
      return {
        id: me.id,
        name: me.info.userName,
      }
    } else {
      return defaultMe
    }
  }

  /** Set callback for successful subscription to the party session channel. */
  public onSubscribed(callback: (me: Member) => void) {
    this.partyChannel.bind(events.pusher.subscribeSuccess, () => callback(this.getMe()))
  }

  /** Get members list from channel members. */
  private getMembers(): Member[] {
    if ('members' in this.partyChannel && 'members' in (this.partyChannel.members as PusherMemberData)) {
      const members = (this.partyChannel.members as PusherMemberData).members
      if (!members) return []
      return Object.entries(members).map(([id, info]) => ({
        id,
        name: info.userName,
      }))
    } else {
      return []
    }
  }

  /** Set callback for members entering or leaving the party session channel. */
  public onMember(callback: (members: Member[]) => void) {
    // Set initial party session members
    this.partyChannel.bind(events.pusher.subscribeSuccess, () => callback(this.getMembers()))

    // Update party session members if new members enter
    this.partyChannel.bind(events.pusher.memberAdded, () => callback(this.getMembers()))

    // Update party session members if members leave
    this.partyChannel.bind(events.pusher.memberRemoved, () => callback(this.getMembers()))
  }
}
