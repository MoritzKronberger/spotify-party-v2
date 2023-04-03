<script setup lang="ts">
  import { helloInput } from './types/trpc'

  // Get tRPC client
  const { $client } = useNuxtApp()
  // Create procedure input
  // Notice how the `Date` class never needs to be stringified or re-created from string (thanks to SuperJSON)
  // (Explicit type for demo purposes only)
  const input: helloInput = {
    text: 'nuxt',
    timestamp: new Date(),
  }
  // Execute tRPC procedure
  const hello = await $client.hello.useQuery(input)
</script>

<template>
  <div>
    <div style="background-color: black; color: white">
      {{ hello.data.value?.greeting }} {{ hello.data.value?.timestamp.toLocaleString() }}
    </div>
    <NuxtWelcome />
  </div>
</template>
