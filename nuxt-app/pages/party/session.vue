<script setup lang="ts">
  import { user } from '~/store/userData'
  definePageMeta({
    layout: 'song-app-bar',
  })

  const getSessionCredentials = () => {
    if (process.client) {
      const username = localStorage.getItem('username') ?? null
      const id = localStorage.getItem('nanoId') ?? null
      if (username && id) {
        user.name = username
        user.id = id
      } else {
        router.push({ path: '/party/join-party', replace: true })
      }
    }
  }
  getSessionCredentials()

  const router = useRouter()
  const route = useRoute()
  const code = route.query.code?.toString() ?? undefined

  /* Pushback */
  if (code === undefined) {
    router.push({ path: '/', replace: true })
  }

  const tab = ref(null)
  const tabs = ['suggestion', 'playlist']
  const suggestion = ref('')

  const partySession = await usePartySession(user.name, user.id)

  const scrollToBottom = () => {
    const listContainer = document.getElementById('listContainer')
    if (listContainer) nextTick(() => listContainer.scrollTo(0, listContainer.scrollHeight))
  }

  const addMessage = () => {
    partySession.addMessage(suggestion.value).then(() => {
      scrollToBottom()
      suggestion.value = ''
    })
  }

  watch(
    () => partySession.messages.value,
    (newValue) => {
      if (newValue) {
        /* scroll to botton on incoming messages */
        scrollToBottom()
      }
    }
  )
</script>

<template>
  <v-container class="flex-column">
    <v-row>
      <v-col>
        <v-btn color="primary" to="/party/invite-friends">invite</v-btn>
      </v-col>
      <v-col class="text-right">
        <guest-button
          :title="Object.keys(partySession.members.value).length"
          :to="`/party/guest-list?code=${partySession.code}`"
        ></guest-button>
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
                      <v-list id="listContainer" lines="one" style="height: 248px" class="overflow-y-auto mx-auto">
                        <div
                          v-for="(msg, index) in partySession.messages.value"
                          :key="index"
                          class="message"
                          :class="{ own: msg.member.id == partySession.me.value?.id }"
                        >
                          <div class="text-body-1">
                            {{ msg.member.isHost ? msg.member.name + ' (host)' : msg.member.name }}
                          </div>
                          <div style="margin-top: 5px"></div>
                          <div class="content">
                            <div>{{ msg.content }}</div>
                          </div>
                        </div>
                      </v-list>
                    </v-col>
                  </v-row>
                  <v-divider thickness="2" class="my-1" />
                  <v-row class="my-1">
                    <v-col>
                      <v-text-field
                        v-model="suggestion"
                        label="Type here"
                        hide-details
                        single-line
                        density="comfortable"
                        @keyup.enter="addMessage"
                      >
                        <template #append>
                          <v-btn
                            icon="mdi-send-variant"
                            variant="text"
                            color="primary"
                            density="compact"
                            @click="addMessage"
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
                    <v-list lines="one" style="height: 350px" class="overflow-y-auto mx-auto">
                      <v-list-item
                        v-for="track in partySession.playlist.value?.tracks"
                        :key="track.id"
                        :title="track.name"
                        :subtitle="'by ' + track.artists?.[0]?.name"
                      >
                        <template #prepend>
                          <v-avatar class="ma-3" rounded="0" size="7vh" variant="elevated">
                            <v-img :src="track.images?.[0]?.url"></v-img>
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
