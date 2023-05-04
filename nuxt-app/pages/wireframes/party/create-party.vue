<script setup lang="ts">
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'

  definePageMeta({
    layout: 'wireframes',
  })
</script>

<template>
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
            <v-switch inset label="Schedule party" />
            <!--            Datepicker nur anzeigen wenn schedule party true ist-->
            <VueDatePicker position="right" />
          </v-col>
          <v-col>
            <button-primary>Create</button-primary>
          </v-col>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
