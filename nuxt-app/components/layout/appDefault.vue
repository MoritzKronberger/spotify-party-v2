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
          <v-btn icon>
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </template>
      </v-app-bar>
      <!-- App content goes here -->
      <v-main>
        <slot />
      </v-main>
      <!-- Optional bottom navigation -->
      <!--      <v-bottom-navigation v-if="!props.hideNavigation">-->
      <!--        <v-btn>-->
      <!--          <v-icon>mdi-location-enter</v-icon>-->
      <!--          Join Party-->
      <!--        </v-btn>-->
      <!--        <v-btn>-->
      <!--          <v-icon>mdi-party-popper</v-icon>-->
      <!--          My Party-->
      <!--        </v-btn>-->
      <!--        <v-btn>-->
      <!--          <v-icon>mdi-account</v-icon>-->
      <!--          Spotify Connect-->
      <!--        </v-btn>-->
      <!--      </v-bottom-navigation>-->
    </v-app>
  </v-theme-provider>
</template>
<style scoped>
  /* Use theme custom properties */
  .gradient-background {
    background: conic-gradient(
      from 116.34deg at 26.17% 63.45%,
      rgb(var(--v-theme-background)) -86.77deg,
      rgb(var(--v-theme-spotify)) 24.49deg,
      rgb(var(--v-theme-openAI)) 180.08deg,
      rgb(var(--v-theme-background)) 273.23deg
    );
  }

  .gradient-background::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    backdrop-filter: blur(600px);
  }
</style>
