<script setup lang="ts">
  const props = defineProps<{
    title: string
    primary?: boolean
  }>()
</script>
<template>
  <v-btn v-if="props.primary" variant="tonal" block>{{ props.title }}</v-btn>
  <v-btn v-else variant="outlined" block>{{ props.title }}</v-btn>
</template>
