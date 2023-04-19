<script setup lang="ts">
  import {
    generateCodeChallenge,
    generateRandomString,
    getPublicSpotifyVars,
    serializeCredentialsCookie,
  } from '../utils/pkce'

  definePageMeta({
    layout: 'default-home',
  })

  const { clientId, redirectURI } = getPublicSpotifyVars()
  const spotifyURL = ref('')
  const codeVerifier = generateRandomString(128)

  onMounted(() => {
    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      const state = generateRandomString(16)
      const scope = 'user-read-private user-read-email'

      // Set code verifier as cookie (to preserve it after OAuth-redirect)
      const verifierCookieString = serializeCredentialsCookie(['code_verifier', codeVerifier], { httpOnly: false })
      document.cookie = verifierCookieString

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
