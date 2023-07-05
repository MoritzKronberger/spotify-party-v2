import { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'
import { getCredentials } from '../utils/credentials'

/**
 * Create context for all incoming request
 * @link https://trpc.io/docs/context
 *
 * Reference: https://trpc-nuxt-docs.vercel.app/get-started/usage/recommended#1-create-a-trpc-router
 */
export const createContext = (event: H3Event) => {
  // Get credentials from request cookies
  const credentials = getCredentials(event)
  return {
    // Pass credentials to tRPC context to be used in auth middleware
    credentials,
    // Pass Nitro event to allow tRPC procedures to interact with it (i.e. for modifying response headers, ect.)
    event,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
