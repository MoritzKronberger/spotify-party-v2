<script setup lang="ts">
  import { genNanoId } from '~/utils/nanoId'

  const guestName = ref('')
  const code = await useSessionCode()

  const enterSession = () => {
    if (guestName.value.length) {
      localStorage.setItem('username', guestName.value)
      localStorage.setItem('nanoId', genNanoId())
      const router = useRouter()
      router.push({ path: '/party/session', query: { code } })
    } else {
      /* AMIN => Log in UI-ELEMENT */
      console.log('Enter name!')
    }
  }
</script>
<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h1>Choose a name</h1>
      </v-col>
    </v-row>
    <v-spacer />
    <v-row>
      <v-col>
        <v-form style="min-width: 300px">
          <v-row>
            <v-col> <v-text-field v-model="guestName" hide-details label="Guest name" /> </v-col>
          </v-row>
          <v-row>
            <v-col>
              <spot-button primary title="continue" @click="enterSession" />
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
