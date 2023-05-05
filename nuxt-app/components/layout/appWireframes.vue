<script setup lang="ts">
  const props = defineProps<{
    hideNavigation?: boolean
  }>()
</script>

<template>
  <v-theme-provider theme="wireframesTheme" with-background>
    <v-app class="gradient-background">
      <!-- Optional top app-bar -->
      <v-app-bar v-if="!props.hideNavigation">
        <v-app-bar-nav-icon icon="mdi-arrow-left" @click="useRouter().back()" />
      </v-app-bar>
      <!-- App content goes here -->
      <v-main>
        <slot />
      </v-main>
      <!-- Optional bottom navigation -->
      <v-bottom-navigation v-if="!props.hideNavigation">
        <v-btn>
          <v-icon>mdi-location-enter</v-icon>
          Join Party
        </v-btn>
        <v-btn>
          <v-icon>mdi-party-popper</v-icon>
          My Party
        </v-btn>
        <v-btn>
          <v-icon>mdi-account</v-icon>
          Spotify Connect
        </v-btn>
      </v-bottom-navigation>
    </v-app>
  </v-theme-provider>
</template>
