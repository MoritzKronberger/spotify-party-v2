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
        <h1>Choose a name</h1>
      </v-col>
    </v-row>
    <v-spacer />
    <v-row>
      <v-col>
        <v-form style="min-width: 300px">
          <v-row>
            <v-col>
              <v-text-field hide-details label="Guest name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <spot-button title="Login instead"></spot-button>
            </v-col>
            <v-col>
              <spot-button primary title="continue" to="/wireframes/home/guest-home" />
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
