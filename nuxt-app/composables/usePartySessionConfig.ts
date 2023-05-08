/** Global config for party session Pusher. */
export const partySessionConfig = {
  events: {
    users: 'users',
    messages: 'messages',
  },
  cacheChannel: (channelName: string) => `cache-${channelName}`,
}
