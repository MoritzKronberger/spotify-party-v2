<script setup lang="ts">
  // Get query code
  const route = useRoute()
  const code = route.query.code as string

  // Get client
  const { $client } = useNuxtApp()

  // Share link
  const partyURL = ref('')

  // Copied-Popup
  const showSnackbar = ref(false)

  const genCode = () => {
    if (code && process.client) {
      // Determine host and protocol dynamically for deployment
      const location = window.location
      const { host, protocol } = location
      partyURL.value = `${protocol}//${host}/party/session?code=${code}`
    }
  }
  genCode()

  const shareCode = () => {
    if (code) {
      navigator.clipboard.writeText(partyURL.value).then(() => {
        showSnackbar.value = true
      })
    }
  }

  const partyName = ref('')
  const partyHost = ref('')
  const getHostInformation = async () => {
    if (code) {
      const party = await $client.party.getPartyByCode.query({ code })
      const hostName = await $client.party.getPartyHostName.query({ code })
      if (party && hostName) {
        partyName.value = party.name
        partyHost.value = hostName
      }
    }
  }

  onBeforeMount(() => {
    getHostInformation()
  })
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
          <VueQr :text="partyURL" size="150" margin="15"></VueQr>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pt-0">
        <p class="text-center text-body-1 font-weight-bold text-primary">{{ partyName }}</p>
        <p class="text-center text-body-2">hosted by {{ partyHost }}</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn prepend-icon="mdi-link" color="primary" @click="shareCode">share Party</v-btn>
      </v-col>
    </v-row>
    <v-snackbar v-model="showSnackbar" :timeout="2000" color="surface">Copied Party-URL</v-snackbar>
  </v-container>
</template>
