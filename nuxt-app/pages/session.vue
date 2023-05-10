<script setup lang="ts">
  definePageMeta({
    layout: 'default-home',
  })

  const message = ref('')

  // Get the party helpers
  const { me, messages, addMessage, members } = usePartySession()
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
        <div v-for="member in members" :key="member.id">{{ member.name }}</div>
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
  </VContainer>
</template>
