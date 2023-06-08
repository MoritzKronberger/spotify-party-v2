import { TRPCError } from '@trpc/server'
import { privateProcedure } from './auth'
import { spotifyProxyAPI } from '~/server/utils/spotifyProxyAPI'
import { getPrivateUserDataFromDB } from '~/server/utils/user'

/** Throws on missing env variables. */
const getClientCredentials = () => {
  const { env } = process
  const clientId = env.SPOTIFY_CLIENT_ID
  const clientSecret = env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret)
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Missing server-side Spotify credentials' })
  return { clientId, clientSecret }
}

/** Middleware for making requests to the Spotify-API involving user data. */
export const spotifyUserProcedure = privateProcedure.use(async ({ next, ctx }) => {
  // Get the user's Spotify credentials from DB
  const user = await getPrivateUserDataFromDB(ctx.user.id)
  if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User not found in database' })

  // Create a new Spotify-API proxy-client with the user's credentials
  const spotifyUserAPI = spotifyProxyAPI(
    // For unauthorized errors, execute before retry:
    async (spotifyAPI) => {
      console.log('Spotify-Web-API Proxy: retrying unauthorized request')
      // Get new access token using refresh token
      const res = await spotifyAPI.refreshAccessToken()
      const { access_token: accessToken, refresh_token: refreshToken } = res.body
      // Set new credentials for Spotify-API client
      spotifyAPI.setCredentials({ accessToken, refreshToken })
      // Update user data in DB with new credentials
      await updateUserCredentials(user.spotifyId, accessToken, refreshToken ?? user.refreshToken)
    },
    // Init Spotify-API client with the user's credentials
    {
      accessToken: user.accessToken,
      refreshToken: user.refreshToken,
      ...getClientCredentials(),
    }
  )

  return next({ ctx: { spotifyClientAPI: spotifyUserAPI } })
})

/** Middleware for making requests to the Spotify-API not involving user data. */
export const spotifyServerProcedure = privateProcedure.use(async ({ next }) => {
  // Create a new Spotify-API proxy-client with server-side credentials
  const spotifyServerAPI = spotifyProxyAPI(
    // For unauthorized errors, execute before retry:
    async (spotifyAPI) => {
      console.log('Spotify-Web-API Proxy: retrying unauthorized request')
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
