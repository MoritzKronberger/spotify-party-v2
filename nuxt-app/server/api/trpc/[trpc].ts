import { createNuxtApiHandler } from 'trpc-nuxt'
import { appRouter } from '~/server/trpc/routers'
import { createContext } from '~/server/trpc/context'

/**
 * Handle all requests to `/trpc`.
 *
 * Reference:
 * https://trpc-nuxt.vercel.app/get-started/usage/recommended#_1-create-a-trpc-router
 */
export default createNuxtApiHandler({
  router: appRouter,
  createContext,
})
