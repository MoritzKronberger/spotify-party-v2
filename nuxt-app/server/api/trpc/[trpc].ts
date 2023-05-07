import { createNuxtApiHandler } from 'trpc-nuxt'
import { appRouter } from '~/server/trpc/routers'
import { createContext } from '~/server/trpc/context'

/** Handle all requests to `/trpc`. */
export default createNuxtApiHandler({
  router: appRouter,
  createContext,
})
