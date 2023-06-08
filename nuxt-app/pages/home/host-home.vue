<script setup lang="ts">
  import user from '~/store/userData'
  import SpotButton from '~/components/spot-button.vue'
  import { genNanoId } from '~~/utils/nanoId'
  // Get tRPC client
  const nuxtApp = useNuxtApp()
  const $client = nuxtApp.$client
  const router = useRouter()

  const userSpotify = await $client.auth.getUser.useQuery()
  const userParties = await $client.party.getUserParties.useQuery()

  /* Storing data userData */
  onMounted(() => {
    if (process.client) {
      if (userSpotify.data.value) {
        user.id = genNanoId()
        user.name = userSpotify.data.value?.display_name
        localStorage.setItem('username', user.name)
        localStorage.setItem('nanoId', user.id)
        user.isHost = true
      } else {
        /* AMIN -> error message log in UI */
        router.push({ path: `/`, replace: true })
      }
    }
  })

  const joinPartyByID = async (partyID: string) => {
    await $client.party.getParty
      .useQuery({ id: partyID })
      .then((result) => {
        if (result.data.value) {
          if (result.data.value[0]?.code) {
            const code = result.data.value[0].code
            user.partyCode = code
            router.push({ path: `/party/session`, query: { code }, replace: true })
          } else {
            /* AMIN -> error message log in UI */
            console.log('Unvalid Party Code')
          }
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const deletePartyByID = async (event: Event, partyID: string) => {
    event.stopPropagation()
    await $client.party.deleteParty
      .mutate({ id: partyID })
      .then(() => {
        const index = userParties.data.value!.findIndex((party) => (party.id = partyID))
        userParties.data.value!.splice(index, 1)
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
        <h1>My Parties</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <p class="text-center text-subtitle-1 font-weight-bold">
              Welcome {{ userSpotify.data.value?.display_name }}
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col v-if="!userParties.data.value">
            <p class="text-center text-body-1">Let your friends control your music.</p>
            <p class="text-center">Get started by opening a new party.</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-col>
      <v-card v-if="userParties.data.value?.length">
        <v-list lines="one" style="height: 300px" class="overflow-y-auto mx-auto">
          <v-list-subheader>All Parties</v-list-subheader>
          <v-list-item
            v-for="party in userParties.data.value"
            :key="party.id"
            :title="party.name"
            :subtitle="party.description ? party.description : ''"
            @click="joinPartyByID(party.id)"
          >
            <template #append>
              <v-btn icon="mdi-delete" @click="deletePartyByID($event, party.id)"></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-row>
      <v-col>
        <spot-button to="/party/create" :primary="true" title="NEW PARTY" />
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
