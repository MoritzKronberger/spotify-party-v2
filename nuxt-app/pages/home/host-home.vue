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
  const edit = ref(false)
  /* Storing data userData */

  if (process.client) {
    if (userSpotify.data.value) {
      /* Check for existing nanoId */
      if (!localStorage.getItem('nanoId')) {
        localStorage.setItem('nanoId', genNanoId())
      }
      /* Check for existing name */
      if (!localStorage.getItem('username')) {
        const name = userSpotify.data.value?.name
        localStorage.setItem('username', name)
      }
      user.name = localStorage.getItem('username') ?? ''
      user.isHost = true
    } else {
      /* Pushback to index-page if no value */
      /* AMIN -> error message log in UI */
      router.push({ path: '/', replace: true })
    }
  }

  const joinPartyByID = async (partyID: string) => {
    await $client.party.getParty
      .useQuery({ id: partyID })
      .then((result) => {
        if (result.data.value) {
          if (result.data.value?.code) {
            const code = result.data.value.code
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
    <!--den text nur anzeigen wenn die Partyliste leer ist-->
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <p class="text-center text-subtitle-1 font-weight-bold">Welcome {{ user.name }}</p>
            <p class="text-center text-body-1">Let your friends control your music.</p>
            <p class="text-center">Get started by opening a new party.</p>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-col>
      <v-card elevation="3">
        <v-col class="align-self-start">
          <v-row>
            <v-col cols="8" align-self="center" class="pb-0">
              <v-list-subheader>All Parties</v-list-subheader>
            </v-col>
            <v-col cols="4" class="text-right pb-0">
              <v-btn v-if="!edit" icon="mdi-pencil" @click="edit = !edit"></v-btn>
              <v-btn v-else icon="mdi-pencil" color="primary" @click="edit = !edit"></v-btn>
            </v-col>
            <v-col class="pt-0"><v-divider /></v-col>
          </v-row>
        </v-col>
        <v-list lines="one" height="40vh" class="overflow-y-auto mx-auto">
          <v-list-item
            v-for="party in userParties.data.value"
            :key="party.id"
            :title="party.name"
            :subtitle="party.description ? party.description : ''"
            @click="joinPartyByID(party.id)"
          >
            <template #append>
              <v-btn v-if="edit" icon="mdi-delete" @click="deletePartyByID($event, party.id)"></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-row>
      <v-col>
        <spot-button primary title="NEW PARTY" />
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
