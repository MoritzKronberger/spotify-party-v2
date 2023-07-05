<script setup lang="ts">
  import { defineProps, defineEmits } from 'vue'

  const props = defineProps<{
    title: string
    primary?: boolean
    error?: boolean
    to?: string
    isHref?: boolean
  }>()

  const emits = defineEmits(['click'])

  const handleClick = () => {
    emits('click')
  }
</script>

<template>
  <v-btn v-if="props.primary && !isHref" block color="primary" :to="props.to" @click="handleClick">{{
    props.title
  }}</v-btn>
  <v-btn v-if="props.primary && isHref" block color="primary" :href="props.to">{{ props.title }}</v-btn>
  <v-btn v-if="props.error" block color="error" :to="props.to" @click="handleClick">{{ props.title }}</v-btn>
  <v-btn v-if="!props.primary && !props.error" variant="outlined" block :to="props.to" @click="handleClick">{{
    props.title
  }}</v-btn>
</template>
