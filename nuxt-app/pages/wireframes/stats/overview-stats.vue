<script setup lang="ts">
  import GuestButton from '~/components/guest-button.vue'
  definePageMeta({
    layout: 'wireframes',
  })
  const mostUpVotedSong = {
    title: 'Very good song',
    artist: 'Artist name',
    image: 'https://vuejs.org/images/logo.png',
  }
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
        <v-card elevation="2">
          <div class="d-flex flex-nowrap justify-space-between">
            <div>
              <v-card-title>Party playlist</v-card-title>
              <v-card-subtitle class="py-1">Playlist name</v-card-subtitle>
              <v-card-actions class="pl-4">
                <v-btn color="primary" variant="elevated" to="/wireframes/stats/playlist-stats">open</v-btn>
              </v-card-actions>
            </div>
            <div class="d-flex flex-column justify-center">
              <v-avatar class="ma-3" rounded="0" size="10vh">
                <v-img src="https://cdn.vuetifyjs.com/images/cards/halcyon.png"></v-img>
              </v-avatar>
            </div>
          </div>
        </v-card>
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
