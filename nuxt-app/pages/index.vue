<script setup lang="ts">
  import { callWithNuxt } from '#app'
  // eslint-disable-next-line import/order
  import { generateCodeChallenge, generateRandomString, getPublicSpotifyVars } from '../utils/pkce'

  definePageMeta({
    layout: 'default-home',
  })

  // direct to host-home if authenticated
  const directURL = ref('')

  // error message
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
    $client.auth.getUser.useQuery().then((result) => {
      if (result.data.value?.id) {
        directURL.value = '/home/host-home'
      } else {
        generateCodeChallenge(codeVerifier).then((codeChallenge) => {
          const state = generateRandomString(16)
          const scope =
            'user-read-private user-read-email playlist-modify-public playlist-modify-private user-read-playback-state user-modify-playback-state ugc-image-upload'

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
          directURL.value = 'https://accounts.spotify.com/authorize?' + args
        })
      }
    })
  })
</script>
<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-img width="40vw" src="/logo_primary.svg" />
    </v-row>
    <v-row>
      <h1>Spotify Party</h1>
    </v-row>
    <v-spacer />
    <v-row style="min-width: 300px">
      <v-col>
        <v-row>
          <v-col>
            <spot-button primary :to="directURL" :is-href="true" title="I AM A HOST" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <spot-button to="/party/join-party" title="I AM A GUEST" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
