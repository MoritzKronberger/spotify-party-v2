<script setup lang="ts">
  import VueDatePicker from '@vuepic/vue-datepicker'
  import '@vuepic/vue-datepicker/dist/main.css'
  import SpotButton from '~/components/spot-button.vue'

  // Get tRPC client
  const { $client } = useNuxtApp()
  // Get router
  const router = useRouter()

  // Temp image-file storage
  const file = ref<File[]>()

  // Keep track of party name input and created party
  const party = {
    name: ref('My Party'),
    description: ref('Birthday Celebration'),
    startAutomatically: ref(new Date()),
    image: file,
  }

  // Control display of Datepicker
  const isScheduledParty = ref(false)

  // Define prop for vuetify-image-validation
  // Ref:
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

  /* const randomTestImage = async () => {
    // Get random image blob from unsplash
    const randomURL = 'https://source.unsplash.com/random/300x300/?party'
    const res = await fetch(randomURL)
    const blob = await res.blob()

    // Convert blob to DataURL
    const dataURL = await blobToDataURL(blob)

    // Split DataURL into data and mime-type
    const data = dataURL.split(',')[1]
    const mimeType = dataURL.split(',')[0]?.split(':')[1]?.split(';')[0]

    if (!data || !mimeType) throw new Error('Could not create random image')

    return { data, mimeType }
  } */

  /* const testPartyProcedures = async (partyName: string, del: boolean) => {
    // Generate random image
    // Create new party
    const party = await $client.party.createParty.mutate({
      party: {
        name: partyName,
        description: 'Test party',
        startAutomatically: new Date(),
      },
      // Add random image to party
      image: undefined,
    })
    console.log('Created:', party)

    // Update and fetch party
    if (party.id) {
      // Fetch party using its Id
      const partyById = await $client.party.getParty.query({ id: party.id })
      console.log('By Id:', partyById)

      const prty = partyById[0]

      if (prty) {
        // Set party name and image URL for loading the party image
        partyRef.value = {
          name: prty.name,
          imageURL: `/api/image?id=${prty.imageId}`,
        }

        // Fetch party again using party code
        const partyByCode = await $client.party.getPartyByCode.query({ code: prty.code })
        console.log('By code:', partyByCode)
      }

      // Update party
      const updateParty = await $client.party.updateParty.mutate({
        id: party.id,
        data: {
          party: {
            name: 'UPDATE ' + partyName,
          },
        },
      })
      console.log('Updated:', updateParty)
    }

    // Re-fetch all parties for current user
    await userParties.refresh()

    // Delete party again if specified
    if (del && party.id) {
      const deleteParty = await $client.party.deleteParty.mutate({ id: party.id })
      console.log('Deleted:', deleteParty)
    }
  } */

  const createParty = async () => {
    await $client.party.createParty
      .mutate({
        party: {
          name: party.name.value,
          description: party.description.value,
          startAutomatically: party.startAutomatically.value,
        },
        image: undefined,
      })
      .then(() => {
        router.push({ path: '/wireframes/home/host-home' })
        // handle the response data here
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
              accept="image/png, image/jpeg, image/jpg"
              label="Picture"
              variant="outlined"
              prepend-icon="mdi-image"
            />
            <v-switch v-model="isScheduledParty" label="Schedule Party" />
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
