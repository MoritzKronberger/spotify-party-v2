<script setup lang="ts">
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
      <v-card>
        <v-list lines="one" style="height: 300px" class="overflow-y-auto mx-auto">
          <v-list-subheader>All Parties</v-list-subheader>
          <v-list-item v-for="party in parties" :key="party.id" :title="party.name" :subtitle="party.songs" />
        </v-list>
      </v-card>
    </v-col>

    <v-row>
      <v-col>
        <v-btn to="/wireframes/party/create-party" variant="tonal">New Party</v-btn>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
