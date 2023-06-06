import SpotifyWebApi from 'spotify-web-api-node'
import { TRPCError } from '@trpc/server'
import { privateProcedure } from './auth'
import { SpotifyServerClient } from '~/server/utils/spotifyServerClient'

const { env } = process

/** Middleware for making requests to the Spotify-API involving user data. */
export const spotifyUserProcedure = privateProcedure.use(({ next, ctx }) => {
  const spotifyUserAPI = new SpotifyWebApi()
  spotifyUserAPI.setAccessToken(ctx.credentials.accessToken)

  return next({ ctx: { spotifyClientAPI: spotifyUserAPI } })
})

/** Middleware for making requests to the Spotify-API not involving user data. */
export const spotifyServerProcedure = privateProcedure.use(async ({ next }) => {
  const clientId = env.SPOTIFY_CLIENT_ID
  const clientSecret = env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret)
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Missing server-side Spotify credentials' })

  const spotifyServerClient = await SpotifyServerClient.init(clientId, clientSecret)
  const spotifyServerAPI = await spotifyServerClient.useWebAPI()

  return next({ ctx: { spotifyServerAPI } })
})
