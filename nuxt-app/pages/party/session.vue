<script setup lang="ts">
  definePageMeta({
    layout: 'song-app-bar',
  })
  // Get client
  const { $client } = useNuxtApp()

  // Get router
  const router = useRouter()

  // Get code from query
  const code = await useSessionCode()

  // Get party by code
  const party = await $client.party.getPartyByCode.useQuery({ code })

  // Get user information
  const user = await useUser(code, party.data.value?.userId)

  // Get party session information
  const partySession = await usePartySession(user.name, user.id)

  // tabs
  const tab = ref(null)
  const tabs = ['suggestion', 'playlist']
  const suggestion = ref('')

  // Set party session status to "active" if host joins party
  let playbackUpdateInterval: NodeJS.Timeout | undefined
  if (user.isHost) {
    await $client.session.startSession.mutate({ session: { sessionCode: partySession.code } })
    playbackUpdateInterval = await partySession.startPlaybackUpdateInterval(60 * 1000, 50) // Use fallback interval of 60 seconds
  }

  // scroll bottom on new message
  const scrollToBottom = () => {
    const listContainer = document.getElementById('listContainer')
    if (listContainer) nextTick(() => listContainer.scrollTo(0, listContainer.scrollHeight))
  }

  // add new message respectively song suggestion
  const addMessage = () => {
    const msg = suggestion.value
    suggestion.value = ''
    partySession.addMessage(msg).then(() => {
      scrollToBottom()
    })
  }

  watch([() => partySession.messages.value, () => partySession.status.value], ([messages, status]) => {
    if (messages) {
      /* scroll to bottom on incoming messages */
      scrollToBottom()
    }

    // redirect if party is getting closed
    if (status === 'closed') {
      router.push({ path: '/party/stats/playlist-stats', query: { code } })
    }
  })

  // redirect if party has been closed
  onBeforeMount(() => {
    if (partySession.status.value === 'closed') {
      router.push({ path: '/party/stats/playlist-stats', query: { code } })
    }
  })

  // scroll down after page render
  onMounted(() => {
    nextTick(() => {
      const listContainer = document.getElementById('listContainer')
      if (listContainer) {
        listContainer.scrollTo(0, listContainer.scrollHeight)
      }
    })
  })

  // Clear playback update interval when leaving page,
  // otherwise multiple intervals will be coexist when going back and forth between pages.
  onUnmounted(() => {
    clearTimeout(playbackUpdateInterval)
  })
</script>

<template>
  <v-container class="flex-column">
    <v-row>
      <v-col>
        <v-btn color="primary" :to="`/party/invite-friends?code=${code}`">invite</v-btn>
      </v-col>
      <v-col v-if="partySession.playback.value?.item">
        <v-app-bar-title>
          <playing-song
            :current-song="{
              title: partySession.playback.value.item.name,
              artist: partySession.playback.value.item.artists.map((artist) => artist.name).join(', '),
              image: partySession.playback.value.item.album.images[0]?.url ?? '',
            }"
            :like="like"
          ></playing-song>
        </v-app-bar-title>
      </v-col>
      <v-col class="text-right">
        <guest-button
          :title="Object.keys(partySession.members.value).length"
          :to="`/party/guest-list?code=${partySession.code}`"
        ></guest-button>
        <v-btn v-if="user.isHost" icon :to="`/party/edit-party?code=${code}`">
          <v-icon>mdi-cog</v-icon>
        </v-btn>
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
                <v-img :src="partySession.playlist.value?.images[0]?.url"></v-img>
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
                        :subtitle="'by ' + track.artists?.map((artist) => artist.name).join(', ')"
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
