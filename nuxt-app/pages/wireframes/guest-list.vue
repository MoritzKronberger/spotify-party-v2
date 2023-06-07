<script setup lang="ts">
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
    <v-card height="100%" style="padding-bottom: 23vh">
      <v-row>
        <v-col>
          <p>Guests</p>
        </v-col>
        <v-col class="text-right">
          <v-btn variant="tonal" prepend-icon="mdi-account-multiple" rounded="xl">1/5</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-list lines="two" style="height: 50vh" class="overflow-y-auto mx-auto">
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
        <v-btn variant="tonal" class="mt-auto">invite</v-btn>
      </v-col>
    </v-card>
  </v-container>
</template>
