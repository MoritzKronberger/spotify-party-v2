<script setup lang="ts">
  const props = defineProps<{
    currentSong: {
      title: string
      artist: string
      image: string
    }
  }>()
</script>
<template>
  <div class="d-flex justify-center">
    <div class="justify-space-between">
      <v-card variant="tonal" max-width="450px" min-width="236px" elevation="1">
        <v-list-item :title="props.currentSong.title" :subtitle="props.currentSong.artist">
          <template #prepend>
            <v-avatar :image="props.currentSong.image" rounded="0"></v-avatar>
          </template>
        </v-list-item>
      </v-card>
    </div>
  </div>
</template>
