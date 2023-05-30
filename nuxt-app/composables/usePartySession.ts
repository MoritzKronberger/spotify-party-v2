import { Message, Member } from '~/types/partySession'
import { PartySession } from '~/utils/partySession'

/**
 * Create party session helper that:
 * - Subscribes to Pusher channel using code from page query params
 * - Joins party with the current user
 * - Provides method for adding new messages
 * - Provides refs to the party's users and messages
 */

const isClientHost = ref<boolean>()

export default function (username: string, userId: string) {
  // Get party code from page query parameters
  const route = useRoute()
  const code = route.query.code?.toString()

  if (!code) throw new Error('Party code is required in query parameters')

  const { $client } = useNuxtApp()

  // Create party session helper
  const partySessionHelper = {
    code,
    me: ref<Member>(),
    messages: ref<Message[]>([]),
    members: ref<Member[]>([]),
    addMessage: (msg: string) =>
      $client.session.addMessage.mutate({
        message: {
          member: {
            id: partySessionHelper.me.value?.id ?? '',
            name: username,
            isHost: partySessionHelper.me.value?.isHost ?? false,
          },
          content: msg,
        },
        session: {
          sessionCode: code,
        },
      }),
  }

  // Client-side only
  if (!process.server) {
    // Initialize Pusher client and subscribe to the party session channel
    const partySession = new PartySession(code, username, userId)

    // Get subscribed user for party session helper
    partySession.onSubscribed((me: Member) => {
      partySessionHelper.me.value = me
    })

    // Update message data for party session helper
    partySession.onMessage((messages: Message[]) => {
      partySessionHelper.messages.value = messages
    })

    // Update party session members for party session helper
    partySession.onMember((members: Member[]) => {
      partySessionHelper.members.value = { ...members }
    })
  }

  return partySessionHelper
}

export { isClientHost }
