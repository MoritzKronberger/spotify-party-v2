<script setup lang="ts">
  import { SongInput } from '../../types/trpc'

  // Get tRPC client
  const { $client } = useNuxtApp()

  // Keep track of song name input
  const songName = ref('')

  // Execute tRPC query
  const songs = $client.songs.getSongs.useQuery()

  const addSong = (songName: string) => {
    // Create procedure input
    // Notice how the `Date` class never needs to be stringified or re-created from string (thanks to SuperJSON)
    // (Explicit type for demo purposes only)
    const song: SongInput = {
      name: songName,
      createdAt: new Date(),
    }
    // Execute tRPC mutation and refresh song procedure on success
    $client.songs.addSong.mutate(song).then(() => {
      songs.refresh()
    })
  }
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h1>Create Party</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-form style="min-width: 300px">
          <v-row>
            <v-col>
              <v-text-field v-model="songName" label="Song name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <button-primary @click="() => addSong(songName)">Add song</button-primary>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-list style="max-height: 400px">
          <v-list-item
            v-for="song in songs.data.value"
            :key="song.id"
            :title="song.name"
            :subtitle="song.createdAt.toLocaleString('de')"
          />
        </v-list>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
