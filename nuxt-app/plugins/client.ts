import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import type { AppRouter } from '~/server/trpc/routers'

export default defineNuxtPlugin(() => {
  /**
   * `createTRPCNuxtClient` adds a `useQuery` composable
   * built on top of `useAsyncData`.
   *
   * Reference: https://trpc-nuxt-docs.vercel.app/get-started/usage/recommended#2-create-trpc-client-plugin
   */
  const client = createTRPCNuxtClient<AppRouter>({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        /**
         * Limit URL length to reasonable size (on request batching)
         *
         * Reference:
         * https://trpc.io/docs/links/httpBatchLink#setting-a-maximum-url-length
         */
        maxURLLength: 2000,
      }),
    ],
  })

  return {
    provide: {
      client,
    },
  }
})
