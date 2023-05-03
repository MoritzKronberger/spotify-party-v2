<script setup lang="ts">
  // Get tRPC client
  const { $client } = useNuxtApp()

  // Keep track of party name input and created party
  const partyName = ref('')
  const partyRef = ref<{ name: string; imageURL: string } | undefined>(undefined)

  // Execute tRPC querys
  const user = $client.auth.getUser.useQuery()
  const userParties = $client.party.getUserParties.useQuery()

  // Convert blob to base64 DataURL
  // Reference: https://stackoverflow.com/a/18650249/14906871
  const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  }

  const randomTestImage = async () => {
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
  }

  const testPartyProcedures = async (partyName: string, del: boolean) => {
    // Generate random image
    const { data: imageData, mimeType: imageMimeType } = await randomTestImage()

    // Create new party
    const party = await $client.party.createParty.mutate({
      party: {
        name: partyName,
        description: 'Test party',
      },
      // Add random image to party
      image:
        imageData && imageMimeType
          ? {
              base64Blob: imageData,
              mimeType: imageMimeType as 'image/jpeg',
            }
          : undefined,
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
  }
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h1>Create Party {{ user.data.value?.display_name }}</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-form style="min-width: 300px">
          <v-row>
            <v-col>
              <v-text-field v-model="partyName" label="Party name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <button-primary @click="() => testPartyProcedures(partyName, false)">Add party</button-primary>
            </v-col>
            <v-col>
              <button-secondary @click="() => testPartyProcedures(partyName, true)"
                >Add party and delete</button-secondary
              >
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-row v-if="partyRef">
      <v-col>
        <div>{{ partyRef.name }}</div>
        <img :src="partyRef.imageURL" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-list style="max-height: 400px">
          <v-list-item
            v-for="party in userParties.data.value"
            :key="party.id"
            :title="party.name"
            :subtitle="party.description ?? ''"
          />
        </v-list>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
