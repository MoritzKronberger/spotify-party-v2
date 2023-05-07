<script setup lang="ts">
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
            <button-primary to="/wireframes/home/host-home">I am a host</button-primary>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <button-secondary to="/wireframes/party/join-party">I am a guest</button-secondary>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
