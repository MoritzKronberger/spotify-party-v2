<script setup lang="ts">
  const props = defineProps<{
    title: string | number
  }>()
</script>
<template>
  <v-btn color="primary" prepend-icon="mdi-account-multiple" rounded="xl">{{ props.title }}</v-btn>
</template>
