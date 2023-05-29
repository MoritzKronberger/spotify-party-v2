<script setup lang="ts">
  import '@vuepic/vue-datepicker/dist/main.css'
  import { ref } from 'vue'
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
        <p>Guests</p>
      </v-col>
      <v-col>
        <v-btn variant="tonal" prepend-icon="mdi-account-multiple" rounded="xl">1/5</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn variant="tonal">invite</v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-list lines="two" style="height: 300px" class="overflow-y-auto mx-auto">
          <v-list-item v-for="(guest, index) in guestList" :key="index" :title="guest.username" :subtitle="guest.role">
            <template #prepend>
              <v-avatar color="grey-lighten-1">
                <v-icon color="white">mdi-account</v-icon>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>
