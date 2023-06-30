<script setup lang="ts">
  const props = defineProps<{
    infoText: string
    primaryText: string
    title?: string
  }>()
  const emit = defineEmits<{
    (e: 'onPrimary'): void
    (e: 'onSecondary'): void
  }>()
</script>
<template>
  <v-dialog activator="parent">
    <v-card>
      <v-card-title v-if="props.title">{{ props.title }}</v-card-title>
      <v-card-text>{{ props.infoText }}</v-card-text>
      <v-card-actions class="pb-6">
        <v-row>
          <v-col class="text-right pb-0" cols="8">
            <v-btn color="primary" variant="elevated" @click="emit('onPrimary')">{{ props.primaryText }}</v-btn>
          </v-col>
          <v-col class="text-right pb-0" cols="4">
            <v-btn variant="outlined" @click="emit('onSecondary')">Cancel</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
