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
    <v-app class="gradient-background">
      <v-app-bar v-if="!props.hideNavigation" color="primary">
        <v-app-bar-nav-icon icon="mdi-arrow-left" @click="useRouter().back()" />
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
