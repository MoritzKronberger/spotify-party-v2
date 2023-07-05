<script setup lang="ts">
  const props = defineProps<{
    hideNavigation?: boolean
  }>()

  const router = useRouter()

  const routeBack = () => {
    router.go(-1)
  }
</script>

<template>
  <v-theme-provider theme="defaultTheme" with-background>
    <v-app class="gradient-background">
      <v-app-bar v-if="!props.hideNavigation" color="primary">
        <v-app-bar-nav-icon icon="mdi-arrow-left" @click="routeBack" />
        <v-app-bar-title><a href="/" class="toolbar-title">Spotify Party</a></v-app-bar-title>
      </v-app-bar>
      <!-- App content goes here -->
      <v-main>
        <slot />
      </v-main>
    </v-app>
  </v-theme-provider>
</template>

<style>
  .toolbar-title {
    text-decoration: none;
    color: var(--v-theme-on-background);
  }
</style>
