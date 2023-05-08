<script setup lang="ts">
  definePageMeta({
    layout: 'default-home',
  })

  const message = ref('')

  // Get the party helper
  const { $partySession } = useNuxtApp()

  const { users, messages, addMessage } = $partySession
</script>

<template>
  <VContainer class="fill-height flex-column">
    <VRow>
      <VCol>
        <div>Current users:</div>
        <div v-for="user in users" :key="user.id">{{ user.name }}</div>
      </VCol>
    </VRow>
    <VRow>
      <VCol>
        <div>Messages:</div>
        <div v-for="message in messages" :key="message.content">{{ message.content }}</div>
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
  </VContainer>
</template>
