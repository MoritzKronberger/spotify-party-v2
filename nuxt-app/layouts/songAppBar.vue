<script setup lang="ts">
  import user from '~/store/userData'
  import AddDefault from '~/components/layout/appDefault.vue'

  const currentSong = { title: 'song title', artist: 'song artist', image: 'https://vuejs.org/images/logo.png' }
  const like = () => undefined

  const defineRoute = () => {
    if (user.isHost) {
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
