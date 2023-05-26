<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'
  definePageMeta({
    layout: 'wireframes',
  })
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h1>My Parties</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <p class="text-center text-subtitle-1 font-weight-bold">Welcome user</p>
            <p class="text-center">Get started by joining a new party.</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <spot-button primary title="join party" />
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
