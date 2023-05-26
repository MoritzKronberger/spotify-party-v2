<script setup lang="ts">
  import { ref } from 'vue'

  const partySession = usePartySession()

  const tab = ref(null)
  const tabs = ['suggestion', 'playlist']
  const suggestion = ref(null)
  const playlist = ref([
    { songname: 'songname', artist: 'michael jackson' },
    { songname: 'songname', artist: 'michael jackson' },
    { songname: 'songname', artist: 'michael jackson' },
    { songname: 'songname', artist: 'michael jackson' },
    { songname: 'songname', artist: 'michael jackson' },
    { songname: 'songname', artist: 'michael jackson' },
  ])
</script>

<template>
  <v-container class="flex-column">
    <v-row>
      <v-col>
        <v-btn variant="tonal">invite</v-btn>
      </v-col>
      <v-col>
        <v-btn variant="tonal" prepend-icon="mdi-account-multiple" rounded="xl">1/5</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-title v-if="tab === 'suggestion'">Song suggestions</v-card-title>
          <v-card-title v-else>Current playlist</v-card-title>
          <v-window v-model="tab">
            <v-window-item v-for="item in tabs" :key="item" :value="item">
              <div v-if="item === 'suggestion'">
                <v-row>
                  <v-col>
                    <v-list lines="one" style="height: 198px" class="overflow-y-auto mx-auto">
                      <v-list-item
                        v-for="(msg, index) in partySession.messages.value"
                        :key="index"
                        :title="msg.content"
                        :subtitle="'by ' + msg.member"
                      />
                    </v-list>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field :v-model="suggestion" label="Type here"></v-text-field>
                  </v-col>
                </v-row>
              </div>
              <div v-else>
                <v-row>
                  <v-col>
                    <v-list lines="one" style="height: 300px" class="overflow-y-auto mx-auto">
                      <v-list-item
                        v-for="(song, index) in playlist"
                        :key="index"
                        :title="song.songname"
                        :subtitle="'by ' + song.artist"
                      />
                    </v-list>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>
          </v-window>
          <v-row>
            <v-col>
              <v-tabs v-model="tab">
                <v-tab v-for="item in tabs" :key="item" :value="item">{{ item }}</v-tab>
              </v-tabs>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
