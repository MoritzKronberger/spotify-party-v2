<script setup lang="ts">
  const code = await useSessionCode()
  const user = await useUser(code)
  const partySession = await usePartySession(user.name, user.id)
</script>

<template>
  <v-container class="flex-column">
    <v-row>
      <v-col>
        <h1 class="text-center py-5">Guest list</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col class="pt-0">
        <v-card class="rounded-lg">
          <v-card-title></v-card-title>
          <v-card-subtitle style="opacity: unset">
            <v-row>
              <v-col>
                <p>Guests</p>
              </v-col>
              <v-col class="text-right">
                <guest-button :title="Object.keys(partySession.members.value).length"></guest-button>
              </v-col>
            </v-row>
          </v-card-subtitle>
          <v-card-item>
            <v-list lines="two" style="height: 50vh" class="overflow-y-auto">
              <v-list-item
                v-for="member in partySession.members.value"
                :key="member.id"
                :title="member.name"
                :subtitle="member.isHost ? 'Host' : 'Gast'"
                class="px-0"
              >
                <template #prepend>
                  <v-avatar color="grey-lighten-1">
                    <v-icon color="white">mdi-account</v-icon>
                  </v-avatar>
                </template>
              </v-list-item>
            </v-list>
          </v-card-item>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <spot-button primary title="invite" to="/party/invite-friends"></spot-button>
      </v-col>
    </v-row>
  </v-container>
</template>
