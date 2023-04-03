<script setup lang="ts">
  import { helloInput } from './types/trpc'

  // Get tRPC client
  const { $client } = useNuxtApp()
  // Create procedure input
  // (Explicit type for demo purposes only)
  const input: helloInput = { text: 'nuxt' }
  // Execute tRPC procedure
  const hello = await $client.hello.useQuery(input)
</script>

<template>
  <div>
    <div style="background-color: black; color: white">{{ hello.data.value?.greeting }}</div>
    <NuxtWelcome />
  </div>
</template>
