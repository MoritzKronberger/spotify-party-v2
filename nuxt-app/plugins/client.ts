import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import superjson from 'superjson'
import { FetchError } from 'ofetch'
import { parse } from 'cookie'
import type { AppRouter } from '~/server/trpc/routers'
import { AppCookies } from '~/composables/useAppCookies'

type CustomFetchInit = RequestInit & { method: 'GET' }

/**
 * Custom fetch function.
 *
 * - Same as `customFetch` defined and used by Nuxt tRPC
 * - Extended to forward cookies to browser during SSR
 *
 * References:
 * - https://github.com/wobsoriano/trpc-nuxt/blob/next/src/client/links.ts
 * - https://github.com/nuxt/nuxt/issues/13096#issuecomment-1397311005
 */
const customFetch = (appCookies: AppCookies, input: RequestInfo | URL, init?: CustomFetchInit) => {
  return globalThis.$fetch
    .raw(input.toString(), init)
    .catch((e) => {
      if (e instanceof FetchError && e.response) {
        return e.response
      }
      throw e
    })
    .then((response) => {
      // Forward cookies to browser during SSR
      if (process.server) {
        // Extract cookie strings from Set-Cookie headers
        const responseCookieStrings: string[] = []
        response.headers
          .get('Set-Cookie')
          // Split individual cookies
          ?.split(',')
          .forEach((cookieHeaderString) => {
            // Split options from cookie `key=value`
            const cookieString = cookieHeaderString.split(';')[0]
            // Add cookie `key=value` string to cookie strings if exists
            if (cookieString) {
              responseCookieStrings.push(cookieString)
            }
          })
        // Only bother trying to forward cookies if cookie strings could be extracted from headers
        if (responseCookieStrings.length > 0) {
          // Parse response cookies into object
          const responseCookies = parse(responseCookieStrings.join(';'))
          // Try updating app cookies from response cookies
          Object.entries(appCookies).forEach(([name, cookie]) => {
            if (name in responseCookies) cookie.value = responseCookies[name] ?? null
          })
        }
      }
      return {
        ...response,
        json: () => Promise.resolve(response._data),
      }
    })
}

export default defineNuxtPlugin(() => {
  const appCookies = useAppCookies()

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
        // Use custom fetch method for forwarding cookies during SSR
        fetch: (input, init) => customFetch(appCookies, input, init as CustomFetchInit),
      }),
    ],
    /**
     * SuperJSON data transformer.
     *
     * Reference:
     * https://trpc.io/docs/server/data-transformers
     */
    transformer: superjson,
  })

  return {
    provide: {
      client,
    },
  }
})
