import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { privateProcedure } from '../middleware/auth'
import { fetchCredentials, setCredentialsCookie } from '~/server/utils/pkce'
import { fetchUserDataFromSpotify } from '~~/server/utils/user'

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

    // Fetch user data using access token
    const userData = await fetchUserDataFromSpotify(accessToken)
    if (!userData)
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Could not fetch user data using access token' })
    // Save user data (and encrypted credentials) to database
    await upsertUser(userData, accessToken, refreshToken).catch((e) => {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message })
    })

    // Set cookies for credentials using Nitro
    setCredentialsCookie(event, 'access_token', accessToken)
    setCredentialsCookie(event, 'refresh_token', refreshToken)

    return true
  }),
  getUser: privateProcedure.query(({ ctx }) => {
    return ctx.user
  }),
})
