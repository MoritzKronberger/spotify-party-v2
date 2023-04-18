<script setup lang="ts">
  import { generateCodeChallenge, generateRandomString } from '../utils/pkce'
  definePageMeta({
    layout: 'default-home',
  })
  const config = useRuntimeConfig()
  const spotifyURL = ref('')
  const clientId = config.public.SPOTIFY_CLIENT_ID
  const redirectUri = config.public.SPOTIFY_CLIENT_REDIRECT_URL
  const codeVerifier = generateRandomString(128)

  onMounted(() => {
    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      const state = generateRandomString(16)
      const scope = 'user-read-private user-read-email'

      localStorage.setItem('code_verifier', codeVerifier)

      const args = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope,
        redirect_uri: redirectUri,
        state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      })
      spotifyURL.value = 'https://accounts.spotify.com/authorize?' + args
      console.log(args)
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
