import type { H3Event } from 'h3'
import { parse } from 'cookie'
import { Credentials } from './pkce'

/**
 * Get credentials from cookie header.
 *
 * Reference:
 * https://trpc-nuxt.vercel.app/get-started/tips/authorization#create-context-from-request-headers
 */
export const getCredentials = (event: H3Event) => {
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

  return credentials
}
