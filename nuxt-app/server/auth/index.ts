// eslint-disable-next-line import/default
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { User, userSchema } from '../utils/user'
import { defaultCredentialsCookieSerializationOpts } from '~/utils/pkce'

const expiresIn = '24h'

export type Credentials = {
  verifier: string // Used to verify user using Spotify's PKCE flow
  jwt: string
}

/** Throw if env variable is missing. */
const useJWTPrivateKey = () => {
  const privateKey = process.env.JWT_PRIVATE_KEY
  if (!privateKey) throw new Error('Missing JWT private key')
  return privateKey
}

/** Sign JWT with public user data payload. */
export const signJWT = (userData: User) => {
  // eslint-disable-next-line import/no-named-as-default-member
  return jwt.sign(userData, useJWTPrivateKey(), { expiresIn })
}

/**
 * Verify JWT and return user data payload.
 *
 * Returns `undefined` if JWT could not be verified.
 */
export const verifyJWT = (token: string) => {
  try {
    // eslint-disable-next-line import/no-named-as-default-member
    const userData = jwt.verify(token, useJWTPrivateKey())
    return userSchema.parse(userData)
  } catch (_) {
    return undefined
  }
}

/**
 * Set JWT as session cookie using Nitro's `setCookie`.
 *
 * Uses sane defaults for serialization options.
 */
export const setJWTCookie = (event: H3Event, token: string) => {
  setCookie(event, 'jwt', token, defaultCredentialsCookieSerializationOpts)
}
