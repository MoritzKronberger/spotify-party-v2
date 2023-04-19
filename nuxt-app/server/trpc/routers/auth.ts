import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { addCredentialsCookieHeaders, fetchCredentials } from '~/server/utils/pkce'

const getCredentialsInputSchema = z.object({
  code: z.string(),
})

/** Handle application wide authentication. */
export const authRouter = router({
  /** Fetch credentials from Spotify API using code and verifier. */
  getCredentials: publicProcedure.input(getCredentialsInputSchema).query(async ({ ctx, input }) => {
    const { credentials, contextHeaders } = ctx
    const { code } = input

    if (!credentials?.verifier) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Missing code verifier!' })

    // Fetch access token (and other credentials) from Spotify API
    // Reference: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
    // (Throw if access token can't be fetched)
    const creds = await fetchCredentials({ code, verifier: credentials.verifier }).catch(() => {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Could not fetch access token!' })
    })

    // Set Set-Cookie response headers for credentials
    addCredentialsCookieHeaders(
      {
        accessToken: creds.access_token,
        refreshToken: creds.refresh_token,
      },
      contextHeaders
    )

    return true
  }),
})
