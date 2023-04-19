import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { fetchCredentials, setCredentialsCookie } from '~/server/utils/pkce'

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
    const creds = await fetchCredentials({ code, verifier: credentials.verifier }).catch(() => {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Could not fetch access token!' })
    })

    // Set cookies for credentials using Nitro
    setCredentialsCookie(event, 'access_token', creds.access_token)
    setCredentialsCookie(event, 'refresh_token', creds.refresh_token)

    return true
  }),
})
