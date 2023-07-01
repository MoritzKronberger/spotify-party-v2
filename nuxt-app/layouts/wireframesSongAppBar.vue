<script setup lang="ts">
  import AppWireframes from '~/components/layout/appWireframes'
  definePageMeta({
    layout: 'wireframes',
  })
  const currentSong = {
    title: 'song title asdfasdf asf',
    artist: 'song artist',
    image: 'https://vuejs.org/images/logo.png',
  }
  const like = () => undefined
</script>
<template>
  <AppWireframes :song="currentSong" :like="like" show-option>
    <slot />
  </AppWireframes>
</template>
