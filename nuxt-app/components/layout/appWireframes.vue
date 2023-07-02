<script setup lang="ts">
  import PlayingSong from '~/components/playing-song.vue'
  const props = defineProps<{
    hideNavigation?: boolean
    song?: { title: string; artist: string; image: string }
    like?: () => void
    showOption?: boolean
  }>()
</script>

<template>
  <v-theme-provider theme="wireframesTheme" with-background>
    <v-app>
      <v-app-bar v-if="!props.hideNavigation" color="primary">
        <v-app-bar-nav-icon icon="mdi-arrow-left" @click="useRouter().back()" />
        <v-app-bar-title v-if="song && like">
          <playing-song :current-song="song" :like="like"></playing-song>
        </v-app-bar-title>
        <template v-if="showOption" #append>
          <v-btn icon to="/wireframes/party/edit-party">
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </template>
      </v-app-bar>
      <v-main>
        <slot />
      </v-main>
    </v-app>
  </v-theme-provider>
</template>
