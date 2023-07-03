export default async function useUser(code: string, partyUserId?: string) {
  if (process.client) {
    const router = useRouter()
    const nuxtApp = useNuxtApp()
    const $client = nuxtApp.$client

    return await $client.auth.getUser
      .query()
      .then((userData) => {
        return { name: userData.name, id: userData.id, isHost: userData.id === partyUserId }
      })
      .catch(async () => {
        const username = localStorage.getItem('username') ?? null
        const userid = localStorage.getItem('nanoId') ?? null
        if (username && userid) {
          return { name: username, id: userid, isHost: false }
        } else {
          await router.push({ path: '/party/login-guest', query: { code } })
          return { name: '', id: '', isHost: false }
        }
      })
  } else {
    return { name: '', id: '', isHost: false }
  }
}
