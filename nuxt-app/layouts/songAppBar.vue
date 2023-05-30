<script setup lang="ts">
  import AddDefault from '~/components/layout/appDefault.vue'

  const currentSong = { title: 'song title', artist: 'song artist', image: 'https://vuejs.org/images/logo.png' }
  const like = () => undefined

  const defineRoute = () => {
    if (isClientHost.value) {
      return '/home/host-home'
    } else {
      return '/'
    }
  }
</script>
<template>
  <AddDefault :route-location="defineRoute()" :song="currentSong" :like="like" show-option>
    <slot />
  </AddDefault>
</template>

<!--<template>-->
<!--  <v-theme-provider theme="wireframesTheme">-->
<!--    <v-app class="gradient-background">-->
<!--      <v-app-bar density="default" color="primary">-->
<!--        <template #prepend>-->
<!--          <v-app-bar-nav-icon icon="mdi-arrow-left" @click="useRouter().back()" />-->
<!--        </template>-->
<!--        <v-app-bar-title>-->
<!--          <playing-song :current-song="currentSong" :like="like"></playing-song>-->
<!--        </v-app-bar-title>-->
<!--        <template #append>-->
<!--          <v-btn icon>-->
<!--            <v-icon>mdi-cog</v-icon>-->
<!--          </v-btn>-->
<!--        </template>-->
<!--      </v-app-bar>-->
<!--      <v-main>-->
<!--        <slot />-->
<!--      </v-main>-->
<!--    </v-app>-->
<!--  </v-theme-provider>-->
<!--</template>-->
