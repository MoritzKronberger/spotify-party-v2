<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'
  import mimeTypes from '~/db/schema/image'
  import { maxImageSizeKB, ImageData, fileToBase64 } from '~/utils/image'

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
  }

  // Define prop for vuetify-image-validation
  // Ref: https://vuetifyjs.com/en/api/v-file-input/#props-validation-value
  const props = defineProps({
    isUpdate: { type: Boolean },
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

  // Get user and session-code
  const code = ref('')
  const user = ref<{ name: string; id: string; isHost: boolean }>()

  // Check for isUpdate -> Edit Mode
  // Fetch party information
  if (props.isUpdate) {
    code.value = await useSessionCode()
    user.value = await useUser(code.value)
    await $client.party.getPartyByCode
      .query({ code: code.value })
      .then((data) => {
        party.name.value = data?.name ?? ''
        party.description.value = data?.description ?? ''
      })
      .catch((error) => {
        console.log(error)
      })
  }
  const updateParty = async () => {
    if (user.value) {
      const partySession = await usePartySession(user.value.name, user.value.id)
      const code = partySession.code

      const partyData = await $client.party.getPartyByCode.query({ code })
      if (partyData) {
        let imageData: ImageData | undefined

        if (file.value[0]) {
          imageData = await fileToBase64(file.value[0])
        }

        await $client.party.updateParty
          .mutate({
            id: partyData.id,
            data: {
              party: {
                name: party.name.value,
                description: party.description.value,
              },
              image: imageData,
            },
          })
          .then(() => {
            router.push({ path: '/party/session', query: { code }, replace: true })
          })
          .catch((error) => {
            console.error(error)
          })
      }
    }
  }

  const closeParty = () => {
    if (code) {
      $client.session.stopSession
        .mutate({ session: { sessionCode: code.value } })
        .then(() => {
          router.push({ path: '/home/host-home' })
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-row>
      <v-col v-if="isUpdate">
        <h1>Edit Party</h1>
      </v-col>
      <v-col v-else>
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
          </v-col>
          <v-col v-if="!isUpdate">
            <spot-button :primary="true" title="Create" @click="createParty" />
          </v-col>
          <v-col v-else>
            <spot-button :primary="true" title="Update" @click="updateParty" />
          </v-col>
          <div v-if="isUpdate">
            <v-row>
              <v-col><h4 class="text-error">Danger Zone</h4></v-col>
            </v-row>
            <v-row style="min-width: 300px">
              <v-col>
                <spot-button title="close party" error @click="closeParty"></spot-button>
              </v-col>
            </v-row>
            <v-row style="min-width: 300px" class="mb-2">
              <v-col>
                <spot-button primary title="start party" :to="`/party/session?code=${code}`"></spot-button>
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>
