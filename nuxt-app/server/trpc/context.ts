import { inferAsyncReturnType } from '@trpc/server'
import type { H3Event } from 'h3'
import { parse } from 'cookie'
import { Credentials } from '../utils/pkce'

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
      accessToken: cookies.access_token,
      refreshToken: cookies.refresh_token,
    }
  }

  return {
    // Pass credentials to tRPC context to be used in auth middleware
    credentials,
    // Create headers object to allow tRPC procedures to modify response headers
    // (Set using `responseMeta` function)
    contextHeaders: new Headers(),
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
