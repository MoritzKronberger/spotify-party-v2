<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'
  const props = defineProps<{
    infoText: string
    onPrimary: () => void
    onSecondary: () => void
    primaryText: string
    title?: string
  }>()
  const showDialog = ref(false)
  const primaryAction = () => {
    props.onPrimary()
    showDialog.value = false
  }
  const secondaryAction = () => {
    props.onSecondary()
    showDialog.value = false
  }
</script>
<template>
  <v-dialog v-model="showDialog" activator="parent" min-width="30vh">
    <v-card>
      <v-card-title v-if="props.title">{{ props.title }}</v-card-title>
      <v-card-text>{{ props.infoText }}</v-card-text>
      <v-card-actions>
        <div class="d-flex">
          <spot-button :title="props.primaryText" primary @click="primaryAction"></spot-button>
          <spot-button title="cancel" primary @click="secondaryAction"></spot-button>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
