import Pusher, { Channel } from 'pusher-js'
import { Message, Member, PresenceData, partyCodeSchema } from '~/types/partySession'

/** Global config for party session Pusher. */
export const partySessionConfig = {
  events: {
    /** Default pusher events. */
    pusher: {
      subscribeSuccess: 'pusher:subscription_succeeded',
      memberAdded: 'pusher:member_added',
      memberRemoved: 'pusher:member_removed',
    },
    /** Custom events. */
    messages: 'messages',
  },
  authEndpoint: (username: string, userId: string) => `/api/pusher_auth?user_name=${username}&user_id=${userId}`,
  presenceCacheChannelPrefix: 'presence-cache-',
  /** Create presence-cache channel using Pusher naming convention.
   *
   * Reference: https://pusher.com/docs/channels/using_channels/channels/#channel-naming-conventions
   */
  presenceCacheChannel: (channelName: string) => `${partySessionConfig.presenceCacheChannelPrefix}${channelName}`,
}

// Unpack session config for convenience
const { events, authEndpoint, presenceCacheChannel } = partySessionConfig

// Types for Pusher channel `members` property
// Reference: https://pusher.com/docs/channels/using_channels/presence-channels/#accessing-channel-members

type PusherMembers = {
  [id: string]: PresenceData['user_info']
}

type PusherMe = {
  id: string
  info: PresenceData['user_info']
}

type PusherMemberData = {
  members: PusherMembers | null
  me: PusherMe | null
}

/** Client-side helper for Pusher party sessions. */
export class PartySession {
  sessionCode: string
  username: string
  userId: string
  pusher: Pusher
  partyChannel: Channel

  /**
   * Create new client-side helper for Pusher party session.
   *
   * Validates session code and subscribes to the party session's Pusher channel.
   */
  constructor(sessionCode: string, username: string, userId: string) {
    // Validate session code
    const uppercaseCode = partyCodeSchema.parse(sessionCode.toUpperCase())
    // Set the session code and username
    this.sessionCode = uppercaseCode
    this.username = username
    this.userId = userId

    // Initialize the pusher client
    // Reference: https://github.com/pusher/pusher-js#configuration
    const publicVars = useRuntimeConfig().public
    this.pusher = new Pusher(publicVars.PUSHER_KEY, {
      cluster: publicVars.PUSHER_CLUSTER,
      channelAuthorization: {
        endpoint: authEndpoint(username, userId),
        transport: 'ajax',
      },
    })

    // Subscribe to the party session channel
    // (Use presence-cache-channel)
    // References: https://pusher.com/docs/channels/using_channels/channels/#channel-types
    // - https://github.com/pusher/pusher-js#subscribing-to-channels
    this.partyChannel = this.pusher.subscribe(presenceCacheChannel(sessionCode))
  }

  /** Set callback for new messages on the party session channel. */
  public onMessage(callback: (messages: Message[]) => void) {
    this.partyChannel.bind(events.messages, callback)
  }

  /** Get me property from channel members. */
  private getMe(): Member {
    const defaultMe = {
      id: this.userId,
      name: this.username,
      isHost: false,
    }
    if ('members' in this.partyChannel && 'members' in (this.partyChannel.members as PusherMemberData)) {
      const me = (this.partyChannel.members as PusherMemberData).me
      if (!me) return defaultMe
      return {
        id: me.id,
        name: me.info.userName,
        isHost: me.info.isHost,
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
        isHost: info.isHost,
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
