<script setup lang="ts">
  import { ref } from 'vue'
  import GuestButton from '~/components/guest-button.vue'

  const tab = ref(null)
  const tabs = ['suggestion', 'playlist']
  const currentUser = 'currentUsername'
  const suggestion = ref(null)
  const suggHistory = ref([
    { user: 'Tim', content: 'my song wish' },
    { user: 'Tim', content: 'my song wish my song wish' },
    { user: 'Bob', content: 'my song wish' },
    { user: 'currentUsername', content: 'my song wish' },
    { user: 'Michael', content: 'my song wish' },
    { user: 'Tim', content: 'my song wish' },
    { user: 'currentUsername', content: 'my song wish' },
    { user: 'currentUsername', content: 'my song wish' },
    { user: 'Bob', content: 'my song wish' },
    { user: 'Michael', content: 'my song wish' },
  ])
  const playlist = ref([
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { songname: 'songname', artist: 'michael jackson', image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
  ])
  const sendSugg = () => {}
  definePageMeta({
    layout: 'wireframes-song-app-bar',
  })
</script>
<template>
  <v-container class="flex-column">
    <v-row>
      <v-col>
        <v-btn color="primary" to="/wireframes/invite-friends">invite</v-btn>
      </v-col>
      <v-col class="text-right">
        <guest-button title="1/5" to="/wireframes/guest-list"></guest-button>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card elevation="10" max-height="64vh">
          <v-card-title v-if="tab === 'suggestion'">
            <v-row class="align-center justify-space-between">
              <v-col> Song suggestions </v-col>
              <v-avatar class="ma-3" rounded="0" size="10vh"> </v-avatar>
            </v-row>
          </v-card-title>
          <v-card-title v-else>
            <v-row class="align-center justify-space-between">
              <v-col>Current playlist</v-col>
              <v-avatar class="ma-3" rounded="0" size="10vh" variant="elevated">
                <v-img src="https://cdn.vuetifyjs.com/images/cards/halcyon.png"></v-img>
              </v-avatar>
            </v-row>
          </v-card-title>
          <div class="mx-3">
            <v-divider thickness="2" />
          </div>
          <v-window v-model="tab" class="mx-3 mt-3">
            <v-window-item v-for="item in tabs" :key="item" :value="item">
              <v-row v-if="item === 'suggestion'">
                <v-col>
                  <v-row>
                    <v-col>
                      <v-list lines="one" style="height: 37vh" class="overflow-y-auto mx-auto">
                        <div
                          v-for="(sugg, index) in suggHistory"
                          :key="index"
                          class="message"
                          :class="{ own: sugg.user === currentUser }"
                        >
                          <div v-if="index > 0 && suggHistory[index - 1].user !== sugg.user" class="text-body-1">
                            {{ sugg.user }}
                          </div>
                          <div v-if="index === 0" class="text-body-1">{{ sugg.user }}</div>
                          <div style="margin-top: 5px"></div>
                          <div class="content">
                            <div v-html="sugg.content"></div>
                          </div>
                        </div>
                      </v-list>
                    </v-col>
                  </v-row>
                  <v-divider thickness="2" class="my-1" />
                  <v-row class="my-1">
                    <v-col>
                      <v-text-field
                        :v-model="suggestion"
                        label="Type here"
                        hide-details
                        single-line
                        density="comfortable"
                      >
                        <template #append>
                          <v-btn
                            icon="mdi-send-variant"
                            variant="text"
                            color="primary"
                            density="compact"
                            @click="sendSugg"
                          ></v-btn>
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <div v-else>
                <v-row>
                  <v-col>
                    <v-list lines="one" style="height: 50vh" class="overflow-y-auto mx-auto">
                      <v-list-item
                        v-for="(song, index) in playlist"
                        :key="index"
                        class="pl-0"
                        :title="song.songname"
                        :subtitle="'by ' + song.artist"
                      >
                        <template #prepend>
                          <v-avatar class="ma-3" rounded="0" size="7vh" variant="elevated">
                            <v-img :src="song.image"></v-img>
                          </v-avatar>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>
          </v-window>
        </v-card>
        <v-row class="my-1">
          <v-col>
            <v-tabs v-model="tab">
              <v-tab v-for="item in tabs" :key="item" :value="item" class="mx-auto" variant="tonal">{{ item }}</v-tab>
            </v-tabs>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
  .message {
    margin-bottom: 10px;
  }
  .message.own {
    text-align: right;
  }
  .message.own .content {
    background-color: #ffffff;
    color: #000000;
  }
  .content {
    padding: 8px;
    background-color: #ffffff;
    color: #000000;
    border-radius: 10px;
    display: inline-block;
    /*box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);*/
    max-width: 50%;
    word-wrap: break-word;
  }
</style>
