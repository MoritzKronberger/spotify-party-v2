<script setup lang="ts">
  import PlayingSong from '~/components/playing-song.vue'
  const props = defineProps<{
    hideNavigation?: boolean
    routeLocation?: string
    song?: { title: string; artist: string; image: string }
    like?: () => void
    showOption?: boolean
  }>()

  const router = useRouter()

  const routeBack = (location: string | undefined) => {
    router.push({ path: location || '/', replace: true })
  }
</script>

<template>
  <v-theme-provider theme="defaultTheme" with-background>
    <v-app class="gradient-background">
      <v-app-bar v-if="!props.hideNavigation" color="primary">
        <v-app-bar-nav-icon icon="mdi-arrow-left" @click="routeBack(routeLocation)" />
        <v-app-bar-title v-if="song && like">
          <playing-song :current-song="song" :like="like"></playing-song>
        </v-app-bar-title>
        <template v-if="showOption" #append>
          <v-btn icon to="/party/edit-party">
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </template>
      </v-app-bar>
      <!-- App content goes here -->
      <v-main>
        <slot />
      </v-main>
    </v-app>
  </v-theme-provider>
</template>
