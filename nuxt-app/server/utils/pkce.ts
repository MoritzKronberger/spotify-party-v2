import { z } from 'zod'
import { getPublicSpotifyVars, defaultCredentialsCookieSerializationOpts } from '~/utils/pkce'
import tsFetch from '~/utils/tsFetch'

export type Credentials = {
  verifier: string
  accessToken: string
  refreshToken: string
  code: string
}

/**
 * Set cookies for H3 event using Nitro's `setCookie`.
 *
 * Uses sane defaults for for serialization options.
 */
export const setCredentialsCookie: typeof setCookie = (event, name, value, opts) => {
  setCookie(event, name, value, { ...defaultCredentialsCookieSerializationOpts, ...opts })
}

/**
 * Spotify API response when requesting an access token.
 *
 * Reference: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
 */
const spotifyAccessTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
})

/**
 * Fetch Spotify OAuth credentials.
 *
 * Uses either code + verifier or refresh token based on the provided credentials.
 *
 * Reference:
 * https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
 */
export const fetchCredentials = async (
  creds: Pick<Credentials, 'code' | 'verifier'> | Pick<Credentials, 'refreshToken'>
) => {
  const { clientId, redirectURI } = getPublicSpotifyVars()
  return await tsFetch(
    'https://accounts.spotify.com/api/token',
    { 200: spotifyAccessTokenResponseSchema },
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(
        'code' in creds
          ? {
              grant_type: 'authorization_code',
              code: creds.code,
              redirect_uri: redirectURI,
              client_id: clientId,
              code_verifier: creds.verifier,
            }
          : {
              grant_type: 'refresh_token',
              refresh_token: creds.refreshToken,
              client_id: clientId,
            }
      ),
    }
  )
}

/**
 * Set auth header for requests to the Spotify API.
 *
 * Reference:
 * https://developer.spotify.com/documentation/web-api/concepts/access-token
 */
export const getAuthHeader = (accessToken: Credentials['accessToken']) => ({
  AUTHORIZATION: `Bearer ${accessToken}`,
})
