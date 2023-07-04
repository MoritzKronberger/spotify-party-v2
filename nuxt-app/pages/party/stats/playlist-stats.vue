<script setup lang="ts">
  const code = await useSessionCode()
  const user = await useUser(code)
  const partySession = await usePartySession(user.name, user.id)
</script>
<template>
  <v-container class="fill-height flex-column">
    <v-spacer></v-spacer>
    <vcol style="height: 80px">
      <v-btn color="primary" variant="elevated" :href="partySession.playlist.value?.shareURL" target="_blank"
        >Open in Spotify</v-btn
      >
    </vcol>
    <vcol style="height: 80px">
      <v-btn variant="elevated" href="/">Return to Home</v-btn>
    </vcol>
    <v-row>
      <v-col>
        <v-expansion-panels>
          <v-expansion-panel>
            <template #title>
              <v-avatar rounded="0" size="10vh">
                <v-img :src="partySession.playlist.value?.images[0]?.url"></v-img>
              </v-avatar>
              <div class="d-flex flex-nowrap justify-space-between">
                <div>
                  <v-card-title>Party playlist</v-card-title>
                  <v-card-subtitle class="py-1">{{ partySession.playlist.value?.name }}</v-card-subtitle>
                </div>
              </div>
            </template>
            <template #text>
              <v-card-item class="px-0">
                <v-list lines="one" style="height: 54vh" class="overflow-y-auto mx-auto py-0">
                  <v-list-item
                    v-for="track in partySession.playlist.value?.tracks"
                    :key="track.id"
                    :title="track.name"
                    :subtitle="'by ' + track.artists?.map((artist) => artist.name).join(', ')"
                    class="px-0"
                  >
                    <template #prepend>
                      <v-avatar class="ma-3" rounded="0" size="7vh">
                        <v-img :src="track.images?.[0]?.url"></v-img>
                      </v-avatar>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-item>
            </template>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
    <v-spacer></v-spacer>
  </v-container>
</template>
