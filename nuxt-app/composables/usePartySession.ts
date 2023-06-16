import { UserMessage, Member, TokenCount } from '~/types/partySession'
import { PartySession } from '~/utils/partySession'
import { Playback, Playlist, SessionStatus } from '~/types/trpc'

/**
 * Create party session helper that:
 * - Subscribes to Pusher channel using code from page query params
 * - Joins party with the current user
 * - Provides method for adding new messages
 * - Provides refs to the party's users and messages
 */

export default async function (username: string, userId: string) {
  // Get party code from page query parameters
  const route = useRoute()
  const code = route.query.code?.toString()

  if (!code) throw new Error('Party code is required in query parameters')

  const { $client } = useNuxtApp()

  // Load initial playlist and messages
  // (Since Pusher cache channel init is sometimes buggy/delayed)
  const session = { session: { sessionCode: code } }
  const messages = await $client.session.getMessages.query(session)
  const playlist = await $client.spotify.getPlaylist.query(session)
  const party = await $client.party.getPartyByCode.query({ code })

  // Create party session helper
  const partySessionHelper = {
    code,
    me: ref<Member>(),
    status: ref<SessionStatus>(party?.sessionStatus ?? 'inactive'),
    messages: ref<UserMessage[]>(messages),
    playlist: ref<Playlist | undefined>(playlist),
    playback: ref<Playback>(undefined),
    members: ref<Member[]>([]),
    tokenCount: ref<TokenCount | undefined>(undefined),
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
        ...session,
      }),
    /**
     * Stat publishing current playback in interval.
     *
     * Interval timeout is either the time until the next song
     * or the fallback timeout if no information about the current song exists.
     *
     * Must be run client-side, since intervals > 60s would cause Vercel Serveless Functions to time out.
     * Reference:
     * https://vercel.com/docs/concepts/functions/serverless-functions#execution-timeout
     *
     * @param fallbackIntervalMs The timeout to use if time until next song can't be calculated.
     * @param progressOffsetMs The time to offset the time until the next song by -> make sure song has "ticked-over"
     */
    startPlaybackUpdateInterval: async (fallbackIntervalMs: number, progressOffsetMs: number) => {
      // Do noting (and stop interval) if session is inactive
      if (partySessionHelper.status.value === 'active') {
        // (Updating playback ref is handled via `onPlayback` callback)
        const playback = await $client.session.publishPlayback.query(session)

        // Calculate time until next track
        // (or use fallback if playback information is missing)
        let timeout = fallbackIntervalMs
        if (playback?.item?.duration_ms && playback.progressMs) {
          timeout = playback?.item?.duration_ms - playback.progressMs + progressOffsetMs
        }

        // Start next interval after timeout
        setTimeout(() => partySessionHelper.startPlaybackUpdateInterval(fallbackIntervalMs, progressOffsetMs), timeout)
      }
    },
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
    partySession.onMessage((messages: UserMessage[]) => {
      partySessionHelper.messages.value = messages
    })

    // Update party session members for party session helper
    partySession.onMember((members: Member[]) => {
      partySessionHelper.members.value = { ...members }
    })

    // Update party session playlist for party session helper
    partySession.onPlaylist(async (tokenCount) => {
      partySessionHelper.tokenCount.value = tokenCount
      partySessionHelper.playlist.value = await $client.spotify.getPlaylist.query(session)
    })

    // Update party session status
    partySession.onStatus((status) => {
      partySessionHelper.status.value = status
    })

    // Update playback
    partySession.onPlayback((playback) => {
      partySessionHelper.playback.value = playback
    })
  }

  return partySessionHelper
}

export { isClientHost }
