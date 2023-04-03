import { inferAsyncReturnType } from '@trpc/server'

/**
 * Create context for all incoming request
 * @link https://trpc.io/docs/context
 *
 * Reference: https://trpc-nuxt-docs.vercel.app/get-started/usage/recommended#1-create-a-trpc-router
 */
export const createContext = () => ({})

export type Context = inferAsyncReturnType<typeof createContext>
