<script setup lang="ts">
  const props = defineProps<{
    title: string
  }>()
</script>
<template>
  <v-btn color="primary" prepend-icon="mdi-account-multiple" rounded="xl" to="/wireframes/guest-list">{{
    props.title
  }}</v-btn>
</template>
