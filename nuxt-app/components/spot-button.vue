<script setup lang="ts">
  const props = defineProps<{
    title: string
    primary?: boolean
    error?: boolean
    to?: string
    isHref?: boolean
  }>()
</script>

<template>
  <v-btn v-if="props.primary && !isHref" block color="primary" :to="props.to">{{ props.title }}</v-btn>
  <v-btn v-if="props.primary && isHref" block color="primary" :href="props.to">{{ props.title }}</v-btn>
  <v-btn v-if="props.error" block color="error" :to="props.to">{{ props.title }}</v-btn>
  <v-btn v-if="!props.primary && !props.error" variant="outlined" block :to="props.to">{{ props.title }}</v-btn>
</template>
