import Pusher from 'pusher-js'
import { Message, User } from '~/types/partySession'
import { genNanoId } from '~/utils/nanoId'

/**
 * Create party session helper that:
 * - Subscribes to Pusher channel using code from page query params
 * - Joins party with the current user
 * - Provides method for adding new messages
 * - Provides refs to the party's users and messages
 */
export default defineNuxtPlugin(async () => {
  const { events, cacheChannel, vars } = usePartySessionConfig()
  // Get party code from page query parameters
  const route = useRoute()
  const code = route.query.code?.toString()

  if (!code) throw new Error('Party code is required in query parameters')

  // TODO: try reading user from local storage?
  const user = { name: `user ${genNanoId()}`, id: genNanoId() }

  const { $client } = useNuxtApp()

  // On the client: join party with user
  if (!process.server) {
    await $client.session.join.mutate({ user, session: { sessionCode: code } })
  }

  // Initialize Pusher client
  const pusher = new Pusher(vars.pusherKey, {
    cluster: vars.pusherCluster,
  })

  // Subscribe to the Pusher party channel
  const partyChannel = pusher.subscribe(cacheChannel(code))

  // Create party session helper
  const partySession = {
    code,
    users: ref<User[]>([]),
    messages: ref<Message[]>([]),
    addMessage: (msg: string) =>
      $client.session.addMessage.mutate({
        message: {
          user,
          content: msg,
        },
        session: {
          sessionCode: code,
        },
      }),
  }

  // Update user data for party session helper
  partyChannel.bind(events.users, (users: User[]) => {
    partySession.users.value = users
  })

  // Update message data for party session helper
  partyChannel.bind(events.messages, (messages: Message[]) => {
    partySession.messages.value = messages
  })

  return {
    provide: {
      partySession,
    },
  }
})
