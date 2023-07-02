<script setup lang="ts">
  const props = defineProps<{
    hideNavigation?: boolean
    routeLocation?: string
    song?: { title: string; artist: string; image: string }
    like?: () => void
    showOption?: boolean
  }>()

  const router = useRouter()
  const route = useRoute()
  const code = route.query.code ?? ''
  const user = await useUser(code.toString())

  const routeBack = (location: string | undefined) => {
    if (!user.isHost && location) {
      router.push({ path: location })
    } else {
      router.go(-1)
    }
  }
</script>

<template>
  <v-theme-provider theme="defaultTheme" with-background>
    <v-app class="gradient-background">
      <v-app-bar v-if="!props.hideNavigation" color="primary">
        <v-app-bar-nav-icon icon="mdi-arrow-left" @click="routeBack(routeLocation)" />
        <template v-if="showOption" #append>
          <v-btn v-if="user.isHost" icon :to="`/party/edit-party?code=${route.query.code}`">
            <v-icon>mdi-cog</v-icon>
          </v-btn>
        </template>
      </v-app-bar>
      <!-- App content goes here -->
      <v-main>
        <slot />
      </v-main>
    </v-app>
  </v-theme-provider>
</template>
