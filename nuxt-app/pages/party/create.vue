<script setup lang="ts">
  definePageMeta({
    middleware: ['auth'],
  })
</script>
<template>
  <CreateParty :is-update="false"></CreateParty>
</template>
