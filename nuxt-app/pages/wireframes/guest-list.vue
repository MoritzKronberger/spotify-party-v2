<script setup lang="ts">
  import { ref } from 'vue'
  import GuestButton from '~/components/guest-button.vue'
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
    <v-card height="100%" style="padding-bottom: 23vh" color="background">
      <v-row>
        <v-col>
          <p>Guests</p>
        </v-col>
        <v-col class="text-right">
          <guest-button title="1/5"></guest-button>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="mt-3">
          <v-list lines="two" style="height: 50vh" class="overflow-y-auto mx-auto rounded-lg">
            <v-list-item
              v-for="(guest, index) in guestList"
              :key="index"
              :title="guest.username"
              :subtitle="guest.role"
            >
              <template #prepend>
                <v-avatar color="grey-lighten-1">
                  <v-icon color="white">mdi-account</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
      <v-col style="bottom: 0; position: absolute" class="text-end">
        <v-btn color="primary" class="mt-auto" to="/wireframes/invite-friends">invite</v-btn>
      </v-col>
    </v-card>
  </v-container>
</template>
