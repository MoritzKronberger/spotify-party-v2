<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'
  definePageMeta({
    layout: 'wireframes-home',
  })
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />
    <v-row style="min-width: 300px">
      <v-col>
        <placeholder-card text="Logo" />
      </v-col>
    </v-row>

    <v-row style="min-width: 300px">
      <v-col>
        <v-row>
          <v-col>
            <spot-button to="/wireframes/party/create-party" title="I AM A HOST" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <spot-button to="/wireframes/login-guest" title="I AM A GUEST"/>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
