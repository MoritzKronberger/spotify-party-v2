<script setup lang="ts">
  import { callWithNuxt } from '#app'
  // eslint-disable-next-line import/order
  import { generateCodeChallenge, generateRandomString, getPublicSpotifyVars } from '../utils/pkce'

  definePageMeta({
    layout: 'default-home',
  })

  const spotifyURL = ref('')
  const errorMessage = ref('')

  // Get tRPC client
  const nuxtApp = useNuxtApp()
  const $client = nuxtApp.$client

  // Get auth code from query parameters
  const route = useRoute()
  const code = route.query.code?.toString()

  // Get code_verifier cookie via useCookie composable
  const { code_verifier: codeVerifierCookie } = useAppCookies()

  // If code was passed (after redirect)
  if (code) {
    // Fetch credentials using auth code
    await $client.auth.getCredentials.useQuery({ code }).then(
      // Redirect if fetching credentials was successful
      () => {
        // Nuxt's `navigateTo` does not work inside async try/catch
        // -> Use `callWithNuxt` to make it work
        // Reference: https://github.com/nuxt/nuxt/issues/14269#issuecomment-1397352832
        callWithNuxt(nuxtApp, navigateTo, ['/home/host-home', { replace: true }])
      },
      // Otherwise show error message
      () => {
        errorMessage.value = 'Something went wrong. Please try again.'
      }
    )
  }

  const { clientId, redirectURI } = getPublicSpotifyVars()
  const codeVerifier = generateRandomString(128)

  onMounted(() => {
    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      const state = generateRandomString(16)
      const scope =
        'user-read-private user-read-email playlist-modify-public playlist-modify-private user-read-playback-state'

      // Set code verifier as cookie (to preserve it after OAuth-redirect)
      codeVerifierCookie.value = codeVerifier

      const args = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope,
        redirect_uri: redirectURI,
        state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      })
      spotifyURL.value = 'https://accounts.spotify.com/authorize?' + args
    })
  })
</script>

<template>
  <VContainer class="fill-height flex-column">
    <VSpacer />
    <VRow style="min-width: 300px">
      <VCol>
        <placeholder-card text="Logo" />
      </VCol>
    </VRow>

    <VRow style="min-width: 300px">
      <VCol>
        <VRow :v-if="errorMessage != ''">
          <VCol>
            <div>{{ errorMessage }}</div>
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <button-primary :href="spotifyURL">I am a host</button-primary>
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <button-secondary>I am a guest</button-secondary>
          </VCol>
        </VRow>
      </VCol>
    </VRow>

    <VSpacer />
  </VContainer>
</template>
