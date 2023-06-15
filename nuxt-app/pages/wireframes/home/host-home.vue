<script setup lang="ts">
  import { ref } from 'vue'
  import SpotButton from '~/components/spot-button.vue'
  import PopUpDialog from '~/components/pop-up-dialog.vue'
  definePageMeta({
    layout: 'wireframes',
  })
  const parties = ref([
    { id: 1, name: 'Party 1', songs: 10, image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { id: 2, name: 'Party 2', songs: 5, image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { id: 3, name: 'Party 3', songs: 5, image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { id: 4, name: 'Party 4', songs: 5, image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
    { id: 5, name: 'Party 5', songs: 5, image: 'https://cdn.vuetifyjs.com/images/john.jpg' },
  ])
  const edit = ref(false)
  const showDialog = ref(false)
  const onDelete = (index: number) => {
    parties.value.splice(index, 1)
    showDialog.value = false
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
    <!--den text nur anzeigen wenn die Partyliste leer ist-->
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <p class="text-center text-subtitle-1 font-weight-bold">Welcome user</p>
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
            v-for="(party, index) in parties"
            :key="party.id"
            :title="party.name"
            :subtitle="party.songs"
            to="/wireframes/stats/overview-stats"
          >
            <template #prepend>
              <v-avatar :image="party.image" rounded="0"></v-avatar>
            </template>
            <template #append>
              <v-btn v-if="edit" icon="mdi-delete" @click="showDialog = true"></v-btn>
            </template>
            <pop-up-dialog
              v-if="showDialog"
              title="Confirm Delete"
              :info-text="'Do you really want to delete the party: ' + party.name"
              primary-text="Delete"
              @onPrimary="onDelete(index)"
              @onSecondary="showDialog = false"
            ></pop-up-dialog>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-row>
      <v-col>
        <spot-button to="/wireframes/party/create-party" primary title="NEW PARTY" />
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
