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
            <nuxt-link to="party/create-party">
              <button-primary> I am a host</button-primary>
            </nuxt-link>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <nuxt-link to="login-guest">
              <button-primary> I am a guest</button-primary>
            </nuxt-link>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-spacer />
  </v-container>
</template>
