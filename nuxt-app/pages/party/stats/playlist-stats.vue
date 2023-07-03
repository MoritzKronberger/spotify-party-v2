<script setup lang="ts">
  const code = await useSessionCode()
  const user = await useUser(code)
  const partySession = await usePartySession(user.name, user.id)
</script>
<template>
  <v-container class="fill-height flex-column">
    <v-spacer></v-spacer>
    <v-card elevation="2" min-width="90vw">
      <div class="d-flex flex-nowrap justify-space-between">
        <div>
          <v-card-title>Party playlist</v-card-title>
          <v-card-subtitle class="py-1">{{ partySession.playlist.value?.name }}</v-card-subtitle>
          <v-card-actions class="pl-4">
            <v-btn color="primary" variant="elevated">save</v-btn>
          </v-card-actions>
        </div>
        <div class="d-flex flex-column justify-center">
          <v-avatar class="ma-3" rounded="0" size="10vh">
            <v-img :src="partySession.playlist.value?.images[0]?.url"></v-img>
          </v-avatar>
        </div>
      </div>
      <v-card-item>
        <v-list lines="one" style="height: 54vh" class="overflow-y-auto mx-auto">
          <v-list-item
            v-for="track in partySession.playlist.value?.tracks"
            :key="track.id"
            :title="track.name"
            :subtitle="'by ' + track.artists?.map((artist) => artist.name).join(', ')"
          >
            <template #prepend>
              <v-avatar class="ma-3" rounded="0" size="7vh">
                <v-img :src="track.images?.[0]?.url"></v-img>
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>
      </v-card-item>
    </v-card>
    <v-spacer></v-spacer>
  </v-container>
</template>
