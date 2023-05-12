<script setup lang="ts">
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  import SpotButton from '~/components/spot-button.vue'
  definePageMeta({
    layout: 'wireframes',
  })

  interface Party {
    name: string
    description: string
    playlistCover?: File[]
    date?: string
  }

  const file = ref<File[]>()

  const isScheduledParty = ref(false)

  const props = defineProps({
    rules: {
      type: Array as () => ((value: File[] | undefined) => true | string)[],
      default: () => [
        (value: File[] | undefined) => {
          if (!value || !value.length) {
            return true // validation passes if value is undefined or empty
          }
          const fileSizeLimit = 2000000 // in bytes
          if (value[0]!.size > fileSizeLimit) {
            return 'Cover size should be less than 2 MB!' // return error message if file size exceeds limit
          }
          return true // validation passes
        },
      ],
    },
  })

  const rules = toRef(props, 'rules')

  const party: Party = {
    name: '',
    description: '',
    playlistCover: file.value,
    date: '',
  }

  const createParty = () => {
    console.log(party)
  }
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
            <v-text-field v-model="party.name" label="Party name" />
            <v-text-field v-model="party.description" label="Description" />
            <v-file-input
              v-model="file"
              clearable
              show-size
              :rules="rules"
              accept="image/png, image/jpeg"
              label="Picture"
              placeholder="Choose a playlist cover"
              variant="outlined"
              prepend-icon="mdi-image"
            />
            <v-switch v-model="isScheduledParty" label="Schedule Party" />
            <div v-if="isScheduledParty">
              <VueDatePicker v-model="party.date" position="right" />
            </div>
          </v-col>
          <v-col>
            <spot-button :primary="true" title="Create" @click="createParty" />
          </v-col>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
