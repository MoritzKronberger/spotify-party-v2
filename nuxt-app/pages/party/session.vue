<script setup lang="ts">
  import user from '~/store/userData'
  import { genNanoId } from '~/utils/nanoId'
  definePageMeta({
    layout: 'song-app-bar',
  })

  const tab = ref(null)
  const tabs = ['suggestion', 'playlist']
  const suggestion = ref('')
  const playlist = ref([{ songname: 'songname', artist: 'michael jackson' }])
  const isCopied = ref(false)

  const addMessage = () => {
    partySession.addMessage(suggestion.value).then(() => {
      const listContainer = document.getElementById('listContainer')!
      listContainer.scrollTop = listContainer.scrollHeight
      suggestion.value = ''
    })
  }

  const getSessionId = (): string => {
    const genId = ref<string>('')
    if (!localStorage.getItem('sessionId')) {
      genId.value = genNanoId()
      localStorage.setItem('sessionId', genId.value)
    } else {
      genId.value = localStorage.getItem('sessionId')!
    }
    console.log('ID')
    console.log(genId.value)
    console.log(user)
    return genId.value
  }

  const partySession = usePartySession(user.name, getSessionId())

  const shareCode = () => {
    navigator.clipboard.writeText(partySession.code).then(() => {
      isCopied.value = true
      setTimeout(() => {
        isCopied.value = false
      }, 3000)
    })
  }
</script>

<template>
  <v-container class="flex-column">
    <v-row>
      <v-col>
        <v-btn variant="tonal" @click="shareCode">invite</v-btn>
        <!-- Invite-Button will route to Share-Page in following update -->
        <v-card-text v-if="isCopied" type="text">Copied to clipboard!</v-card-text>
      </v-col>
      <v-col class="text-right">
        <v-btn variant="tonal" prepend-icon="mdi-account-multiple" rounded="xl">{{
          Object.keys(partySession.members.value).length
        }}</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card elevation="2">
          <v-card-title v-if="tab === 'suggestion'">Song suggestions</v-card-title>
          <v-card-title v-else>Current playlist</v-card-title>
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
                          :class="{ own: msg.member.isHost == true }"
                        >
                          <div
                            v-if="index > 0 && partySession.members.value[index - 1]?.id !== msg.member.id"
                            class="text-body-1"
                          >
                            {{ msg.member.isHost ? msg.member.name + ' (host)' : msg.member.name }}
                          </div>
                          <div v-if="index === 0" class="text-body-1">
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
                    <v-col cols="10">
                      <v-text-field v-model="suggestion" label="Type here" @keyup.enter="addMessage" />
                    </v-col>
                    <v-col cols="1" class="mx-auto">
                      <v-btn icon="mdi-send-variant" @click="addMessage"></v-btn>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <div v-else>
                <v-row>
                  <v-col>
                    <v-list lines="one" style="height: 350px" class="overflow-y-auto mx-auto">
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
    background-color: #a6a6a6;
  }
  .content {
    padding: 8px;
    background-color: #a6a6a6;
    border-radius: 10px;
    display: inline-block;
    /*box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 2px 1px -1px rgba(0, 0, 0, 0.12);*/
    max-width: 50%;
    word-wrap: break-word;
  }
</style>
