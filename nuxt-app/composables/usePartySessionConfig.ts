/** Global config for party session Pusher. */
export const partySessionConfig = {
  events: {
    users: 'users',
    messages: 'messages',
  },
  cacheChannel: (channelName: string) => `cache-${channelName}`,
}

/** Composable for keeping the server's and client's party session Pusher config in sync. */
export default function () {
  const publicVars = useRuntimeConfig().public
  return {
    ...partySessionConfig,
    vars: {
      pusherKey: publicVars.PUSHER_KEY,
      pusherCluster: publicVars.PUSHER_CLUSTER,
    },
  }
}
