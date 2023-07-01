<script setup lang="ts">
  import user from '~/store/userData'
  const isCopied = ref(false)
  const shareCode = () => {
    if (user.partyCode) {
      navigator.clipboard.writeText(user.partyCode).then(() => {
        isCopied.value = true
        setTimeout(() => {
          isCopied.value = false
        }, 3000)
      })
    }
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
        <v-card variant="outlined" class="pa-5">
          <VueQr text="Hello World!" size="150" margin="15"></VueQr>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pt-0">
        <p class="text-center text-body-1 font-weight-bold">Party Name</p>
        <p class="text-center text-body-2">hosted by hostname</p>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-btn primary prepend-icon="mdi-link" variant="tonal" @click="shareCode">share code</v-btn>
        <v-card-text v-if="isCopied" type="text">Copied to clipboard!</v-card-text>
      </v-col>
    </v-row>
  </v-container>
</template>
