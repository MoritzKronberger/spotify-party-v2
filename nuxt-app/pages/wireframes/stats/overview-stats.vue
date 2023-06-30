<script setup lang="ts">
  import { ref } from 'vue'
  import GuestButton from '~/components/guest-button.vue'
  definePageMeta({
    layout: 'wireframes',
  })
  const mostUpVotedSong = {
    title: 'Very good song',
    artist: 'Artist name',
    image: 'https://vuejs.org/images/logo.png',
  }
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
  <v-container class="flex-column">
    <v-row>
      <v-col>
        <p class="text-h5">Party stats</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-expansion-panels>
          <v-expansion-panel>
            <template #title>
              <v-avatar rounded="0" size="10vh">
                <v-img src="https://cdn.vuetifyjs.com/images/cards/halcyon.png"></v-img>
              </v-avatar>
              <div class="d-flex flex-nowrap justify-space-between">
                <div>
                  <v-card-title>Party playlist</v-card-title>
                  <v-card-subtitle class="py-1">Playlist name</v-card-subtitle>
                </div>
              </div>
            </template>
            <template #text>
              <v-card-item class="px-0">
                <v-list lines="one" style="height: 54vh" class="overflow-y-auto mx-auto py-0">
                  <v-list-item
                    v-for="(song, index) in playlist"
                    :key="index"
                    :title="song.songname"
                    :subtitle="'by ' + song.artist"
                    class="px-0"
                  >
                    <template #prepend>
                      <v-avatar class="ma-3" rounded="0" size="7vh">
                        <v-img :src="song.image"></v-img>
                      </v-avatar>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-item>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p>Active guests</p>
      </v-col>
      <v-col class="text-right">
        <guest-button title="1/5" to="/wireframes/guest-list"></guest-button>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <p class="pb-1">Most up voted</p>
        <v-card variant="tonal">
          <v-list-item
            :title="mostUpVotedSong.title"
            :subtitle="mostUpVotedSong.artist"
            :prepend-avatar="mostUpVotedSong.image"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<style>
  .v-expansion-panel-text__wrapper {
    padding-left: 0;
  }
</style>
