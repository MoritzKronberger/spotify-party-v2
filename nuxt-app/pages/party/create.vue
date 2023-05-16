<script setup lang="ts">
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  import SpotButton from '~/components/spot-button.vue'
  import { MimeType } from '~/types/trpc'
  // Get tRPC client
  const { $client } = useNuxtApp()
  // Get router
  const router = useRouter()

  // Temp image-file storage
  const file = ref<File[]>([])

  // Keep track of party name input and created party
  const party = {
    name: ref(''),
    description: ref(''),
    startAutomatically: ref<Date | null | undefined>(null),
  }
  const base64Blob = ref<string | undefined>(undefined)
  const mimeType = ref<MimeType>()

  // Control display of Datepicker
  const isScheduledParty = ref<boolean>(false)

  // Update scheduler on changes
  const updateScheduledParty = () => {
    isScheduledParty.value = !isScheduledParty.value
    if (isScheduledParty.value) {
      party.startAutomatically.value = new Date()
    } else {
      party.startAutomatically.value = null
    }
  }

  // Define prop for vuetify-image-validation
  // Ref: https://vuetifyjs.com/en/api/v-file-input/#props-validation-value
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

  // New reference rules prop -> reactive
  const rules = toRef(props, 'rules')

  // File to Blob(Base-64) Conversion
  // FileReader API: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
  // FileReader.readAsDataURL(): https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  const fileToBase64 = (file: File | undefined): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1]
          if (base64) {
            const decoder = new TextDecoder('utf-8')
            const buffer = decoder.decode(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)))
            resolve(buffer)
          } else {
            reject(new Error('Failed to convert file to Base64'))
          }
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file!)
    })
  }

  const createParty = async () => {
    if (file.value[0]) {
      base64Blob.value = await fileToBase64(file.value[0])
      mimeType.value = file.value[0].type as MimeType
    }

    await $client.party.createParty
      .mutate({
        party: {
          name: party.name.value,
          description: party.description.value,
          startAutomatically: party.startAutomatically.value,
        },
        image: file.value[0] ? { base64Blob: base64Blob.value!, mimeType: mimeType.value! } : undefined,
      })
      .then(() => {
        router.push({ path: '/home/host-home', replace: true })
      })
      .catch((error) => {
        console.error(error)
      })
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
            <v-text-field v-model="party.name.value" label="Party name" />
            <v-text-field v-model="party.description.value" label="Description" />
            <v-file-input
              v-model="file"
              clearable
              :rules="rules"
              :accept="MimeType"
              label="Picture"
              variant="outlined"
              prepend-icon="mdi-image"
            />
            <v-switch label="Schedule Party" @click="updateScheduledParty" />
            <div v-if="isScheduledParty">
              <VueDatePicker v-model="party.startAutomatically.value" position="right" />
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
