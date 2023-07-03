<script setup lang="ts">
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  import SpotButton from '~/components/spot-button.vue'
  import { maxImageSizeKB, mimeTypes, MimeType } from '~/utils/image'

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

  // Control display of Datepicker
  const isScheduledParty = ref<boolean>(false)

  // Update scheduler on changes
  const updateScheduledParty = () => {
    isScheduledParty.value = !isScheduledParty.value
    if (!isScheduledParty.value) {
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
        async (value: File[] | undefined) => {
          if (!value || !value.length || !value[0]) {
            return true // validation passes if value is undefined or empty
          }
          const fileSizeLimitBytes = maxImageSizeKB * 1024 // in bytes
          // Account for conversion to base64 in file size limit
          // References:
          // - https://stackoverflow.com/a/13378842/14906871
          // - https://stackoverflow.com/a/22012837/14906871
          // (In practice, estimating 0.75 might suffice)
          const base64FileSizeLimitBytes = (3 * (4 * Math.ceil(fileSizeLimitBytes / 4))) / 4
          const buf = await value[0].arrayBuffer()
          const fileSizeBytes = buf.byteLength
          if (fileSizeBytes > base64FileSizeLimitBytes) {
            return `Image size of ${Math.round(fileSizeBytes / 1024)} KB exceeds limit of ${Math.round(
              base64FileSizeLimitBytes / 1024
            )} KB!` // return error message if file size exceeds limit
          }
          return true // validation passes
        },
      ],
    },
  })

  // New reference rules prop -> reactive
  const rules = toRef(props, 'rules')

  type ImageData = { mimeType: MimeType; base64Blob: string }

  // File to Blob(Base-64) Conversion
  // FileReader API: https://developer.mozilla.org/en-US/docs/Web/API/FileReader
  // FileReader.readAsDataURL(): https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  const fileToBase64 = (file: File) => {
    return new Promise<ImageData>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result?.toString()
        if (!result) return reject
        const [header, base64Blob] = result.split(',')
        if (!header || !base64Blob) return reject
        resolve({
          mimeType: header.replace('data:', '').replace(';base64', '') as MimeType,
          base64Blob,
        })
      }
      reader.onerror = reject
    })
  }

  const createParty = async () => {
    let imageData: ImageData | undefined

    if (file.value[0]) {
      imageData = await fileToBase64(file.value[0])
    }

    await $client.party.createParty
      .mutate({
        party: {
          name: party.name.value,
          description: party.description.value,
          startAutomatically: party.startAutomatically.value,
        },
        image: imageData,
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
              :accept="mimeTypes"
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
