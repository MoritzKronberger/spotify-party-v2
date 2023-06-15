<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'

  definePageMeta({
    layout: 'wireframes',
  })
  const parties = [
    { id: 1, name: 'Option 1', songs: 'asdfasdf' },
    { id: 2, name: 'Option 2', songs: 'adsfasdf' },
    { id: 3, name: 'Option 3', songs: 'asdf' },
    { id: 4, name: 'Option 4', songs: 'adsfasdf' },
    { id: 5, name: 'Option 5', songs: 'adsfasdf' },
  ]
</script>
<template>
  <v-container class="flex-column">
    <v-row>
      <v-col>
        <p class="text-h5">Settings</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div align="center">
          <v-img aspect-ratio="1" cover width="15vh" src="https://cdn.vuetifyjs.com/images/parallax/material.jpg" />
        </div>
        <div align="center" class="pt-1">
          <h4>Party image</h4>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col style="max-width: 50vh">
        <v-text-field label="Party title" hide-details></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-list lines="one" class="rounded-lg">
          <v-list-item v-for="party in parties" :key="party.id" :title="party.name" :subtitle="party.songs">
            <template #append>
              <v-switch color="primary" inset density="compact"></v-switch>
            </template>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
    <v-row>
      <v-col><h4 class="text-error">Danger Zone</h4></v-col>
    </v-row>
    <v-row>
      <v-col>
        <spot-button title="close party" error></spot-button>
      </v-col>
    </v-row>
  </v-container>
</template>
