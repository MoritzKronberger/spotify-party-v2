<script setup lang="ts">
  import SvgIcon from '@jamescoyle/vue-icon'
  import { mdiQrcodeScan } from '@mdi/js'
  import SpotButton from '~/components/spot-button.vue'
  // Get tRPC client
  const nuxtApp = useNuxtApp()
  const router = useRouter()
  const $client = nuxtApp.$client
  const path = mdiQrcodeScan

  const partyCode = ref('')

  const joinParty = () => {
    /* Check if code respectively party is existing */
    $client.party.checkPartyExists
      .useQuery({ code: partyCode.value })
      .then((result) => {
        if (result.data.value?.exists) {
          const code: any = partyCode.value
          router.push({ path: `/party/session`, query: { code }, replace: true })
        } else {
          /* AMIN -> message log in UI */
          console.log('This party doesnt exist!')
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h1>Join Party</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-row>
          <v-col align="center">
            <svg-icon type="mdi" :path="path" size="80" />
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center">
            <spot-button :primary="true" title="scan qr code" />
          </v-col>
        </v-row>

        <v-row>
          <v-col align="center">
            <p class="text-center font-weight-bold">or</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-text-field v-model="partyCode" label="Enter Code" />
              </v-col>
            </v-row>
            <spot-button :primary="true" title="join" @click="joinParty" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
