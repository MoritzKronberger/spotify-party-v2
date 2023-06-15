<script setup lang="ts">
  import { ref } from 'vue'
  import GuestButton from '~/components/guest-button.vue'
  import SpotButton from '~/components/spot-button.vue'
  const guestList = ref([
    { username: 'username', role: 'Gastgeber' },
    { username: 'username', role: 'Gast' },
    { username: 'username', role: 'Gast' },
    { username: 'username', role: 'Gast' },
  ])
  definePageMeta({
    layout: 'wireframes',
  })
</script>

<template>
  <v-container class="flex-column">
    <v-row>
      <v-col>
        <h1 class="text-center py-5">Guest list</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="pt-0">
        <v-card class="rounded-lg">
          <v-card-title></v-card-title>
          <v-card-subtitle style="opacity: unset">
            <v-row>
              <v-col>
                <p>Guests</p>
              </v-col>
              <v-col class="text-right">
                <guest-button title="5"></guest-button>
              </v-col>
            </v-row>
          </v-card-subtitle>
          <v-card-item>
            <v-list lines="two" style="height: 50vh" class="overflow-y-auto">
              <v-list-item
                v-for="(guest, index) in guestList"
                :key="index"
                :title="guest.username"
                :subtitle="guest.role"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar color="grey-lighten-1">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                </template>
              </v-list-item>
            </v-list>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <spot-button primary title="invite" to="/wireframes/invite-friends"></spot-button>
      </v-col>
    </v-row>
  </v-container>
</template>
