<script setup lang="ts">
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  const isScheduledParty = ref(false)
  definePageMeta({
    layout: 'wireframes',
  })
</script>

<template>
  <div>
    <v-container class="fill-height flex-column">
      <v-row>
        <v-col>
          <h1>Create Party</h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-form style="min-width: 300px">
            <v-col>
              <v-text-field label="Party name" />
              <v-text-field label="Description" />
              <v-file-input clearable accept="image/*" label="Picture" variant="outlined" prepend-icon="mdi-image" />
              <v-switch v-model="isScheduledParty" inset label="Schedule Party" />
              <div v-if="isScheduledParty">
                <VueDatePicker position="right" />
              </div>
            </v-col>
            <v-col>
              <button-primary>Create</button-primary>
            </v-col>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
