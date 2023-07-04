<script setup lang="ts">
  definePageMeta({
    middleware: ['auth'],
  })
  const nuxtApp = useNuxtApp()
  const router = useRouter()

  // get user information
  const $client = nuxtApp.$client
  const userParties = await $client.party.getUserParties.useQuery()
  const user = await $client.auth.getUser.query()

  const joinPartyByID = async (partyID: string) => {
    await $client.party.getParty
      .useQuery({ id: partyID })
      .then((result) => {
        if (result.data.value?.code) {
          const code = result.data.value.code
          if (result.data.value.sessionStatus === 'active' || result.data.value.sessionStatus === 'inactive') {
            router.push({ path: '/party/session', query: { code } })
          } else if (result.data.value.sessionStatus === 'closed') {
            router.push({ path: '/party/stats/playlist-stats', query: { code } })
          }
        } else {
          /* AMIN -> error message log in UI */
          console.log('Invalid Party Code')
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const deletePartyByID = async (partyID: string | undefined) => {
    if (partyID) {
      await $client.party.deleteParty
        .mutate({ id: partyID })
        .then(() => {
          userParties.refresh()
          dialogIsActive.value = false
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  const dialogIsActive = ref(false)
  const edit = ref(false)
  const partyToDelete = ref<{ name: string; id: string }>()
  const setDialog = (partyName: string, partyID: string) => {
    partyToDelete.value = { name: partyName, id: partyID }
    dialogIsActive.value = !dialogIsActive.value
  }

  const partyStatus = (status: string) => {
    if (status === 'active') {
      return 'join'
    } else if (status === 'inactive') {
      return 'start'
    }
    return status
  }
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h1 class="text-primary">My Parties</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <p class="text-center text-subtitle-1 font-weight-bold">Welcome {{ user.name }}</p>
            <p class="text-center text-body-1">Let your friends control your music.</p>
            <v-col v-if="!userParties.data.value">
              <p class="text-center">Get started by opening a new party.</p>
            </v-col>
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
            @click.stop="joinPartyByID(party.id)"
          >
            <template #prepend>
              <v-avatar>
                <template v-if="party.imageId">
                  <img
                    :src="`/api/image?id=${party.imageId}`"
                    alt="Party Image"
                    style="width: 100px; height: 100px; object-fit: contain"
                  />
                </template>
                <template v-else>
                  <div
                    style="
                      width: 200px;
                      height: 200px;
                      background-image: linear-gradient(to bottom, rgb(26, 171, 104), rgb(255, 255, 255));
                      transition: background-image 0.5s linear;
                    "
                  ></div>
                </template>
              </v-avatar>
            </template>
            <template #append>
              <v-list-item-subtitle>{{ partyStatus(party.sessionStatus) }}</v-list-item-subtitle>
              <v-btn v-if="edit" icon="mdi-delete" @click.stop="setDialog(party.name, party.id)"></v-btn>
              <v-btn v-else icon="mdi-arrow-right"></v-btn>
            </template>
          </v-list-item>
        </v-list>
        <pop-up-dialog
          v-model="dialogIsActive"
          title="Confirm Delete"
          :disabled="!edit"
          :info-text="`Do you really want to delete the party: ${partyToDelete?.name}`"
          primary-text="Delete"
          @on-primary="deletePartyByID(partyToDelete?.id)"
          @on-secondary="dialogIsActive = !dialogIsActive"
        ></pop-up-dialog>
      </v-card>
    </v-col>

    <v-row>
      <v-col>
        <spot-button primary to="/party/create" title="NEW PARTY" />
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
