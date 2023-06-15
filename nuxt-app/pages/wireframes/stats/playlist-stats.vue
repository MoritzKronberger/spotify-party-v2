<script setup lang="ts">
  import { ref } from 'vue'
  definePageMeta({
    layout: 'wireframes',
  })
  const playlist = ref([
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
  ])
</script>
<template>
  <v-container class="fill-height flex-column">
    <v-spacer></v-spacer>
    <v-card elevation="2" min-width="90vw">
      <div class="d-flex flex-nowrap justify-space-between">
        <div>
          <v-card-title>Party playlist</v-card-title>
          <v-card-subtitle class="py-1">Playlist name</v-card-subtitle>
          <v-card-actions class="pl-4">
            <v-btn color="primary" variant="elevated">open</v-btn>
          </v-card-actions>
        </div>
        <div class="d-flex flex-column justify-center">
          <v-avatar class="ma-3" rounded="0" size="10vh">
            <v-img src="https://cdn.vuetifyjs.com/images/cards/halcyon.png"></v-img>
          </v-avatar>
        </div>
      </div>
      <v-card-item>
        <v-list lines="one" style="height: 54vh" class="overflow-y-auto mx-auto">
          <v-list-item
            v-for="(song, index) in playlist"
            :key="index"
            :title="song.songname"
            :subtitle="'by ' + song.artist"
          >
            <template #prepend>
              <v-avatar class="ma-3" rounded="0" size="7vh">
                <v-img :src="song.image"></v-img>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
      </v-card-item>
    </v-card>
    <v-spacer></v-spacer>
  </v-container>
</template>
