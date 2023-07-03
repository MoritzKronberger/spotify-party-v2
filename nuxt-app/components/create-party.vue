<script setup lang="ts">
  import SpotButton from '~/components/spot-button.vue'
  import { MimeType } from '~/types/trpc'
  import { mimeTypes } from '~/db/schema/image'
  import { fileToBase64 } from '~/utils/imageHelper'
  // Get tRPC client
  const { $client } = useNuxtApp()
  // Get router
  const router = useRouter()

  // Get user and session-code
  const code = await useSessionCode()
  const user = await useUser(code)

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

  const base64Blob = ref<string | undefined>(undefined)
  const mimeType = ref<MimeType>()
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

  // Check for isUpdate -> Edit Mode
  // Fetch party information
  if (props.isUpdate) {
    await $client.party.getPartyByCode
      .query({ code })
      .then((data) => {
        party.name.value = data?.name ?? ''
        party.description.value = data?.description ?? ''
      })
      .catch((error) => {
        console.log(error)
      })
  }
  const updateParty = async () => {
    const partySession = await usePartySession(user.name, user.id)
    const code = partySession.code

    const partyData = await $client.party.getPartyByCode.query({ code })
    if (partyData) {
      await $client.party.updateParty
        .mutate({
          id: partyData.id,
          data: {
            party: {
              name: party.name.value,
              description: party.description.value,
            },
            image: file.value[0] ? { base64Blob: base64Blob.value!, mimeType: mimeType.value! } : undefined,
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

  const closeParty = () => {
    if (code) {
      $client.session.stopSession
        .mutate({ session: { sessionCode: code } })
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
