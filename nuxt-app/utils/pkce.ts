import { serialize, type CookieSerializeOptions } from 'cookie'

// Spotify OAuth //
export const generateRandomString = (length: number): string => {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

const base64encode = (arr: ArrayBuffer): string => {
  const uint8Array = new Uint8Array(arr)
  // const buf = Buffer.from(uint8Array)
  // const base64 = buf.toString('base64')
  const str = String.fromCharCode.apply(null, Array.from(uint8Array))
  const base64 = btoa(str)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  // Code Challenge
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return base64encode(digest)
}

/** Get public env variables for Spotify API. */
export const getPublicSpotifyVars = () => {
  const config = useRuntimeConfig()
  return {
    clientId: config.public.SPOTIFY_CLIENT_ID,
    redirectURI: config.public.SPOTIFY_CLIENT_REDIRECT_URL,
  }
}

/**
 * Sane defaults for serializing credentials cookies.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#Secure_and_HttpOnly_cookies
 */
export const defaultCredentialsCookieSerializationOpts = {
  sameSite: 'lax',
  secure: true,
  httpOnly: true,
  path: '/',
} as const

/** Serialize cookies as using sane defaults for serialization options. */
export const serializeCredentialsCookie = (cred: [string, string], opts?: CookieSerializeOptions) => {
  return serialize(...cred, { ...defaultCredentialsCookieSerializationOpts, ...opts })
}
