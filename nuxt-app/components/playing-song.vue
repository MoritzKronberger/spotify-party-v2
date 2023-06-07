<script setup lang="ts">
  const props = defineProps<{
    currentSong: {
      title: string
      artist: string
      image: string
    }
    like: () => void
  }>()
</script>
<template>
  <div>
    <v-card variant="tonal">
      <v-list-item
        :title="props.currentSong.title"
        :subtitle="props.currentSong.artist"
        :prepend-avatar="props.currentSong.image"
      >
        <template #append>
          <v-btn icon="mdi-heart-outline" @click="like()"></v-btn>
        </template>
      </v-list-item>
    </v-card>
  </div>
</template>
