<script setup lang="ts">
  definePageMeta({
    layout: 'wireframes',
  })
  const showSnackbar = ref(false)
  const copyCode = () => {
    showSnackbar.value = true
  }
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h2 class="text-center text-primary">Invite your friends</h2>
        <h2 class="text-center">to choose the music</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="mt-0 pt-0">
        <p class="text-center text-body-2">
          Let them scan the QR-Code or send them the access code with the button down below
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pb-0">
        <v-card class="pa-5 bg-background">
          <VueQr text="Hello World!" size="150" margin="15"></VueQr>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pt-0">
        <p class="text-center text-body-1 font-weight-bold text-primary">Party Name</p>
        <p class="text-center text-body-2">hosted by hostname</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn prepend-icon="mdi-link" color="primary" @click="copyCode">share code</v-btn>
      </v-col>
    </v-row>
    <v-snackbar v-model="showSnackbar" :timeout="2000" color="surface">Copied code</v-snackbar>
  </v-container>
</template>
