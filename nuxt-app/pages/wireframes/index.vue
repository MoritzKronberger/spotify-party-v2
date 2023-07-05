<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'
  definePageMeta({
    layout: 'wireframes-home',
  })
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-img width="40vw" src="/logo_primary.svg" />
    </v-row>
    <v-row>
      <h1>Spotify Party</h1>
    </v-row>
    <v-spacer />
    <v-row style="min-width: 300px">
      <v-col>
        <v-row>
          <v-col>
            <spot-button primary to="/wireframes/party/create-party" title="I AM A HOST" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <spot-button to="/wireframes/login-guest" title="I AM A GUEST" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
