<script setup lang="ts">
  import { SongInput } from './types/trpc'

  // Get tRPC client
  const { $client } = useNuxtApp()

  // Keep track of song name input
  const songName = ref('')

  // Execute tRPC query
  const songs = $client.getSongs.useQuery()

  const addSong = (songName: string) => {
    // Create procedure input
    // Notice how the `Date` class never needs to be stringified or re-created from string (thanks to SuperJSON)
    // (Explicit type for demo purposes only)
    const song: SongInput = {
      name: songName,
      createdAt: new Date(),
    }
    // Execute tRPC mutation and refresh song procedure on success
    $client.addSong.mutate(song).then(() => {
      songs.refresh()
    })
  }
</script>

<template>
  <div>
    <div style="background-color: black; color: white">
      <input v-model="songName" type="text" placeholder="Song name" />
      <button @click="() => addSong(songName)">Add song</button>
    </div>
    <ul v-for="song in songs.data.value" :key="song.id">
      <li>{{ song.name }}</li>
    </ul>
    <NuxtWelcome />
  </div>
</template>
