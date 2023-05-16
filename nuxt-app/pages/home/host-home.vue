<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'

  // Get tRPC client
  const nuxtApp = useNuxtApp()
  const $client = nuxtApp.$client

  const userParties = await $client.party.getUserParties.useQuery()
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
          <v-list-item
            v-for="party in userParties.data.value"
            :key="party.id"
            :title="party.name"
            :subtitle="party.description ? party.description : ''"
          />
        </v-list>
      </v-card>
    </v-col>

    <v-row>
      <v-col>
        <spot-button to="/party/create" :primary="true" title="NEW PARTY" />
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
