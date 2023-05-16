export default defineNuxtRouteMiddleware(async () => {
  const app = useNuxtApp()
  const $client = app.$client

  try {
    await $client.auth.getUser.query()
  } catch {
    // temporarily redirect to '/' for visual indication of unauthorized
    return navigateTo('/')
  }
})
