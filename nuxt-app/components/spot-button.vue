<script setup lang="ts">
  const props = defineProps<{
    title: string
    primary?: boolean
    error?: boolean
    to?: string
  }>()
</script>
<template>
  <v-btn v-if="props.primary" block color="primary" :to="to">{{ props.title }}</v-btn>
  <v-btn v-if="props.error" block color="error" :to="to">{{ props.title }}</v-btn>
  <v-btn v-if="!props.primary && !props.error" variant="outlined" block :to="to">{{ props.title }}</v-btn>
</template>
