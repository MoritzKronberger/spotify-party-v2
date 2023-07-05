<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'

  definePageMeta({
    layout: 'wireframes',
  })
  const party = {
    name: 'party name',
    description: 'my description',
    picture: 'https://cdn.vuetifyjs.com/images/parallax/material.jpg',
    status: 'CREATED',
  }
</script>
<template>
  <v-container class="flex-column fill-height">
    <v-spacer></v-spacer>
    <v-row>
      <v-col>
        <h1 class="text-white">Settings</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-form style="min-width: 85vw">
          <v-col>
            <v-text-field label="Party name" />
            <v-text-field label="Description" />
            <v-file-input label="Picture" variant="outlined" prepend-icon="mdi-image">
              <template v-if="party.picture" #append>
                <div class="mb-3">
                  <v-img v-if="party.picture" aspect-ratio="1" cover width="8vh" :src="party.picture" />
                </div>
              </template>
            </v-file-input>
          </v-col>
        </v-form>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
    <div v-if="party.status === 'RUNNING'">
      <v-row>
        <v-col><h4 class="text-error">Danger Zone</h4></v-col>
      </v-row>
      <v-row style="min-width: 85vw">
        <v-col>
          <spot-button title="close party" error></spot-button>
        </v-col>
      </v-row>
    </div>
    <div v-if="party.status === 'CREATED'">
      <v-row style="min-width: 85vw" class="mb-2">
        <v-col>
          <spot-button primary title="start party" to="/wireframes/party/overview-party"></spot-button>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>
