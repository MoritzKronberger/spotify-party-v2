import SpotifyWebApi from 'spotify-web-api-node'
import { TRPCError } from '@trpc/server'
import { privateProcedure } from './auth'
import { SpotifyServerClient } from '~/server/utils/spotifyServerClient'
import { getPrivateUserDataFromDB } from '~~/server/utils/user'

const { env } = process

/** Middleware for making requests to the Spotify-API involving user data. */
export const spotifyUserProcedure = privateProcedure.use(async ({ next, ctx }) => {
  // Get the user's Spotify credentials from DB
  const user = await getPrivateUserDataFromDB(ctx.user.id)
  if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'User not found in database' })

  // Create a new Spotify-API client with the user's credentials
  const spotifyUserAPI = new SpotifyWebApi()
  // TODO: Check if tokens are valid, refresh if needed and update DB
  spotifyUserAPI.setAccessToken(user.accessToken)
  spotifyUserAPI.setRefreshToken(user.refreshToken)

  return next({ ctx: { spotifyClientAPI: spotifyUserAPI } })
})

/** Middleware for making requests to the Spotify-API not involving user data. */
export const spotifyServerProcedure = privateProcedure.use(async ({ next }) => {
  const clientId = env.SPOTIFY_CLIENT_ID
  const clientSecret = env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret)
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Missing server-side Spotify credentials' })

  // Create a new Spotify-API client with server-side credentials
  const spotifyServerClient = await SpotifyServerClient.init(clientId, clientSecret)
  const spotifyServerAPI = await spotifyServerClient.useWebAPI()

  return next({ ctx: { spotifyServerAPI } })
})
