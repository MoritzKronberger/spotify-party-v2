<script setup lang="ts">
  import { SongInput } from '../types/trpc'

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
  <v-theme-provider theme="customTheme" with-background>
    <div>
      <v-form>
        <v-container>
          <v-row>
            <v-col>
              <v-text-field v-model="songName" label="Song name" rounded="x-large"></v-text-field>
            </v-col>
            <v-col>
              <v-btn variant="flat" @click="() => addSong(songName)">Add song</v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <ul>
        <li v-for="song in songs.data.value" :key="song.id">{{ song.name }}</li>
      </ul>
    </div>
  </v-theme-provider>
</template>
