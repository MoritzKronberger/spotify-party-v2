import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { privateProcedure } from '../middleware/auth'
import { fetchCredentials } from '~/server/utils/pkce'
import { fetchUserDataFromSpotify } from '~~/server/utils/user'
import { setJWTCookie, signJWT } from '~/server/auth'

const getCredentialsInputSchema = z.object({
  code: z.string(),
})

/** Handle application wide authentication. */
export const authRouter = router({
  /** Fetch credentials from Spotify API using code and verifier. */
  getCredentials: publicProcedure.input(getCredentialsInputSchema).query(async ({ ctx, input }) => {
    const { credentials, event } = ctx
    const { code } = input

    if (!credentials?.verifier) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing code verifier!' })

    // Fetch access token (and other credentials) from Spotify API
    // Reference: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
    // (Throw if access token can't be fetched)
    const { access_token: accessToken, refresh_token: refreshToken } = await fetchCredentials({
      code,
      verifier: credentials.verifier,
    }).catch(() => {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Could not fetch access token!' })
    })

    // Fetch Spotify user data using access token
    const userData = await fetchUserDataFromSpotify(accessToken)
    if (!userData)
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Could not fetch user data using access token' })

    // Save Spotify user data (and encrypted credentials) to database
    const user = await upsertUser(userData, accessToken, refreshToken).catch((e) => {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message })
    })
    if (!user) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Could fetch user from database' })

    // Create JWT as replacement for Spotify credentials, since they are used server-side
    const jwt = signJWT(user)

    // Set JWT as cookie using Nitro
    setJWTCookie(event, jwt)

    return true
  }),
  getUser: privateProcedure.query(({ ctx }) => {
    return ctx.user
  }),
})
