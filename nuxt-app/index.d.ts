import { createTRPCNuxtClient } from 'trpc-nuxt/client'
import { AppRouter } from './server/trpc/routers'

declare module '#app' {
  interface NuxtApp {
    $client: ReturnType<typeof createTRPCNuxtClient<AppRouter>>
  }
}
export {}
