<script setup lang="ts">
  import { genNanoId } from '~/utils/nanoId'

  definePageMeta({
    layout: 'default-home',
  })

  const message = ref('')

  // TODO: Get username from local storage:
  // - If reading/writing from/to local storage everything should be done in a `if (process.client) {...}` block!
  // - Local storage is untrusted data source -> validate content using zod
  // - Maybe offload local-storage-logic (process-check & validation) into composable (resulting in : `const localStorageContent = useLocalStorage()`)
  const username = `user ${genNanoId()}`
  // Generate new userId (only used if no Id exists in local storage)
  const userId = genNanoId()

  // Get the party helpers
  const { me, messages, addMessage, members, playlist } = usePartySession(username, userId)

  // TODO: Save user data (`me`) to local storage
</script>

<template>
  <VContainer class="fill-height flex-column">
    <VRow>
      <VCol>
        <div>Hello {{ me?.name }}</div>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <div>Current users:</div>
        <div v-for="member in members" :key="member.id">{{ member.name }} {{ member.isHost ? 'HOST' : '' }}</div>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <div>Messages:</div>
        <div v-for="msg in messages" :key="msg.id">{{ msg.content }}</div>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <v-text-field v-model="message" label="Message" />
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <button-primary @click="() => addMessage(message)">Send message</button-primary>
      </VCol>
    </VRow>
    <VRow v-if="playlist">
      <VCol>
        <div v-for="track in playlist.tracks" :key="track.id">{{ track.name }}</div>
      </VCol>
    </VRow>
  </VContainer>
</template>
