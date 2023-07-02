<script setup lang="ts">
  const router = useRouter()
  const code = await useSessionCode()
  const user = await useUser(code)
  const partySession = await usePartySession(user.name, user.id)
  const nuxtApp = useNuxtApp()
  const $client = nuxtApp.$client
  const closeParty = () => {
    if (code) {
      $client.session.stopSession
        .mutate({ session: { sessionCode: code } })
        .then(() => {
          router.push({ path: '/home/host-home' })
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
</script>
<template>
  <v-container class="flex-column fill-height">
    <v-spacer></v-spacer>
    <v-row>
      <v-col>
        <h1 class="text-white">Settings</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-form style="min-width: 85vw">
          <v-col>
            <v-text-field label="Party name" />
            <v-text-field label="Description" />
            <v-file-input label="Picture" variant="outlined" prepend-icon="mdi-image">
              <template v-if="partySession.playlist.value?.images[0]" #append>
                <div class="mb-3">
                  <v-img
                    v-if="partySession.playlist.value?.images[0]"
                    aspect-ratio="1"
                    cover
                    width="8vh"
                    :src="partySession.playlist.value?.images[0].url"
                  />
                </div>
              </template>
            </v-file-input>
          </v-col>
        </v-form>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
    <div v-if="partySession.status.value === 'active'">
      <v-row>
        <v-col><h4 class="text-error">Danger Zone</h4></v-col>
      </v-row>
      <v-row style="min-width: 85vw">
        <v-col>
          <spot-button title="close party" error @click="closeParty"></spot-button>
        </v-col>
      </v-row>
    </div>
    <div v-if="partySession.status.value === 'inactive'">
      <v-row style="min-width: 85vw" class="mb-2">
        <v-col>
          <spot-button primary title="start party" :to="`/party/session?code=${code}`"></spot-button>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>
