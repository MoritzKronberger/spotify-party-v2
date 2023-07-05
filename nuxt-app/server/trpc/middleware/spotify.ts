import { TRPCError } from '@trpc/server'
import { privateProcedure } from './auth'
import { sessionProcedure } from './isSession'
import { spotifyProxyAPI } from '~/server/utils/spotifyProxyAPI'
import { PrivateUser, getPrivateUserDataFromDB } from '~/server/utils/user'
import { log } from '~/server/utils/logging'

/** Throws on missing env variables. */
const getClientCredentials = () => {
  const { env } = process
  const clientId = env.SPOTIFY_CLIENT_ID
  const clientSecret = env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret)
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Missing server-side Spotify credentials' })
  return { clientId, clientSecret }
}

/** Create a new Spotify-API proxy-client with the user's credentials  */
const createSpotifyUserAPI = (user?: PrivateUser) => {
  if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User not found in database' })
  if (!user.accessToken || !user.refreshToken)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'No credentials found for user.' })

  return spotifyProxyAPI(
    // For unauthorized errors, execute before retry:
    async (spotifyAPI) => {
      log('Spotify-Web-API Proxy: retrying unauthorized request')
      // Get new access token using refresh token
      const res = await spotifyAPI.refreshAccessToken()
      const { access_token: accessToken, refresh_token: refreshToken } = res.body
      if (!refreshToken)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Received no refresh token when requesting new access token',
        })
      // Set new credentials for Spotify-API client
      spotifyAPI.setCredentials({ accessToken, refreshToken })
      // Update user data in DB with new credentials
      await updateUserCredentials(user.spotifyId, accessToken, refreshToken)
    },
    // Init Spotify-API client with the user's credentials
    {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      ...getClientCredentials(),
    }
  )
}

/** Middleware for making requests to the Spotify-API involving user data. */
export const spotifyUserProcedure = privateProcedure.use(async ({ next, ctx }) => {
  // Get the user's Spotify credentials from DB
  const user = await getPrivateUserDataFromDB(ctx.user.id)

  const spotifyUserAPI = createSpotifyUserAPI(user)
  return next({ ctx: { spotifyUserAPI } })
})

/** Middleware for making requests to the Spotify-API not involving user data. */
export const spotifyServerProcedure = privateProcedure.use(async ({ next }) => {
  // Create a new Spotify-API proxy-client with server-side credentials
  const spotifyServerAPI = spotifyProxyAPI(
    // For unauthorized errors, execute before retry:
    async (spotifyAPI) => {
      log('Spotify-Web-API Proxy: retrying unauthorized request')
      // Set new access token using client credentials
      const res = await spotifyAPI.clientCredentialsGrant()
      spotifyAPI.setAccessToken(res.body.access_token)
    },
    // Initialize Spotify-API with client credentials
    getClientCredentials()
  )

  // Set initial access token using client credentials
  const res = await spotifyServerAPI.clientCredentialsGrant()
  spotifyServerAPI.setAccessToken(res.body.access_token)

  return next({ ctx: { spotifyServerAPI } })
})

/**
 * Middleware for allowing all session members to make requests to the Spotify-API that involve the host's user data.
 *
 * USE WITH CAUTION!
 */
export const spotifySessionUserProcedure = sessionProcedure.use(async ({ next, ctx }) => {
  // Get the user's Spotify credentials from DB
  const user = await getPrivateUserDataFromDB(ctx.party.userId)
  if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User not found in database' })

  // Create a new Spotify-API proxy-client with the user's credentials
  const spotifyUserAPI = createSpotifyUserAPI(user)
  return next({ ctx: { spotifyUserAPI } })
})
