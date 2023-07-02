import { createTRPCNuxtClient } from 'trpc-nuxt/client'
import { AppRouter } from './server/trpc/routers'

// Fixes unknown type of app.$client
// Reference: https://github.com/wobsoriano/trpc-nuxt/issues/91
declare module '#app' {
  interface NuxtApp {
    $client: ReturnType<typeof createTRPCNuxtClient<AppRouter>>
  }
}
export {}
