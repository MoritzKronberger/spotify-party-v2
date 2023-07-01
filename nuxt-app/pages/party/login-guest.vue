<script setup lang="ts">
  import { genNanoId } from '~/utils/nanoId'
  import user from '~/store/userData'

  const route = useRoute()

  const guestName = ref('')

  const enterSession = () => {
    if (guestName.value.length) {
      const code = route.query.code
      user.name = guestName.value
      user.id = genNanoId()
      localStorage.setItem('username', user.name)
      localStorage.setItem('nanoId', user.id)
      const router = useRouter()
      router.push({ path: '/party/session', query: { code }, replace: true })
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

    <v-row>
      <v-col>
        <v-form style="min-width: 300px">
          <v-row>
            <v-col>
              <v-text-field v-model="guestName" label="Guest name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <button-primary @click="enterSession">Continue</button-primary>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-btn variant="text">Login instead</v-btn>
    <v-spacer />
  </v-container>
</template>
