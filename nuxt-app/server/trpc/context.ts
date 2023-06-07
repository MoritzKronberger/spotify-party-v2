import { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'
import { parse } from 'cookie'
import { Credentials } from '../auth'

/**
 * Create context for all incoming request
 * @link https://trpc.io/docs/context
 *
 * Reference: https://trpc-nuxt-docs.vercel.app/get-started/usage/recommended#1-create-a-trpc-router
 */
export const createContext = (event: H3Event) => {
  // Get cookie header from request
  // Reference:
  // https://trpc-nuxt.vercel.app/get-started/tips/authorization#create-context-from-request-headers
  const rawCookies = getRequestHeader(event, 'cookie')
  let credentials: Partial<Credentials> = {}
  // Parse cookie string and extract credentials
  if (rawCookies) {
    const cookies = parse(rawCookies)
    credentials = {
      verifier: cookies.code_verifier,
      jwt: cookies.jwt,
    }
  }

  return {
    // Pass credentials to tRPC context to be used in auth middleware
    credentials,
    // Pass Nitro event to allow tRPC procedures to interact with it (i.e. for modifying response headers, ect.)
    event,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
