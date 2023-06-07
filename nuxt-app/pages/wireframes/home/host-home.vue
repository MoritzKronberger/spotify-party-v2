<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'
  definePageMeta({
    layout: 'wireframes',
  })
  const parties = [
    { id: 1, name: 'Party 1', songs: 10 },
    { id: 2, name: 'Party 2', songs: 5 },
    { id: 3, name: 'Party 3', songs: 5 },
    { id: 4, name: 'Party 4', songs: 5 },
    { id: 5, name: 'Party 5', songs: 5 },
  ]
  const deleteParty = () => {}
  const edit = ref(false)
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h1>My Parties</h1>
      </v-col>
    </v-row>
    <!--den text nur anzeigen wenn die Partyliste leer ist-->
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <p class="text-center text-subtitle-1 font-weight-bold">Welcome user</p>
            <p class="text-center text-body-1">Let your friends control your music.</p>
            <p class="text-center">Get started by opening a new party.</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-col>
      <v-card elevation="3">
        <v-col class="align-self-start">
          <v-row>
            <v-col cols="8" align-self="center" class="pb-0">
              <v-list-subheader>All Parties</v-list-subheader>
            </v-col>
            <v-col cols="4" class="text-right pb-0">
              <v-btn v-if="!edit" icon="mdi-pencil" @click="edit = !edit"></v-btn>
              <v-btn v-else icon="mdi-pencil" @click="edit = !edit" color="primary"></v-btn>
            </v-col>
            <v-col class="pt-0"><v-divider /></v-col>
          </v-row>
        </v-col>
        <v-list lines="one" height="40vh" class="overflow-y-auto mx-auto">
          <v-list-item v-for="party in parties" :key="party.id" :title="party.name" :subtitle="party.songs">
            <template #append>
              <v-btn v-if="edit" icon="mdi-delete" @click="deleteParty()"></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-row>
      <v-col>
        <spot-button primary title="NEW PARTY" />
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
