import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import type { H3Event } from 'h3'
import { middleware, publicProcedure } from '../trpc'
import { fetchCredentials, getAuthHeader } from '~/server/utils/pkce'
import tsFetch from '~/utils/tsFetch'

/**
 * User data as returned by the Spotify API.
 *
 * Reference:
 * https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
 */
const spotifyUserSchema = z.object({
  country: z.string(),
  display_name: z.string(),
  email: z.string(),
  explicit_content: z.object({
    filter_enabled: z.boolean(),
    filter_locked: z.boolean(),
  }),
  external_urls: z.object({
    spotify: z.string(),
  }),
  followers: z.object({
    href: z.string().nullable(),
    total: z.number(),
  }),
  href: z.string(),
  id: z.string(),
  images: z
    .object({
      url: z.string(),
      height: z.number().nullable(),
      width: z.number().nullable(),
    })
    .array(),
  product: z.string(),
  type: z.string(),
  uri: z.string(),
})

/**
 * Unauthorized error as returned by the Spotify API.
 *
 * Reference:
 * https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
 */
const spotifyUserUnauthorizedSchema = z.object({ error: z.object({ status: z.number(), message: z.string() }) })

/**
 * Helper function to update refresh and access token.
 *
 * - Fetches new credentials using refresh token.
 * - Sets cookies for new credentials using Nitro.
 */
const updateCredentials = async (refreshToken: string, event: H3Event) => {
  const res = await fetchCredentials({ refreshToken })
  setCookie(event, 'access_token', res.access_token)
  setCookie(event, 'refresh_token', res.refresh_token)
  return {
    accessToken: res.access_token,
    refreshToken: res.refresh_token,
  }
}

/** Fetch user data from Spotify API. */
const fetchUserData = async (accessToken: string) => {
  return await tsFetch(
    'https://api.spotify.com/v1/me',
    { 200: spotifyUserSchema, 401: spotifyUserUnauthorizedSchema },
    { headers: getAuthHeader(accessToken) }
  )
}

/**
 * Authentication middleware.
 *
 * - Checks that provided credentials can be used to fetch user data from Spotify API
 * - Passes user data into tRPC context
 *
 * Reference:
 * https://trpc.io/docs/v9/middlewares
 */
const isAuthed = middleware(async ({ next, ctx }) => {
  let { accessToken, refreshToken } = ctx.credentials
  const { event } = ctx
  const unauthorizedError = new TRPCError({ code: 'UNAUTHORIZED' })

  // Throw if both, access and refresh token, are missing
  if (!accessToken && !refreshToken) throw unauthorizedError

  let user: z.infer<typeof spotifyUserSchema>

  // Update credentials (incl. cookies) using refresh token if no access token exists
  // (Throw if access token can't be fetched)
  if (!accessToken && refreshToken) {
    ;({ accessToken, refreshToken } = await updateCredentials(refreshToken, event).catch(() => {
      throw unauthorizedError
    }))
  }

  // Access and refresh tokens should now be set, but access token might be expired or invalid.
  if (!accessToken || !refreshToken) throw unauthorizedError

  const userDataError = new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Could not fetch user data!' })

  // Try fetching user data using access token
  // (Throw on any other status codes than 200 and 401)
  const userRes = await fetchUserData(accessToken).catch(() => {
    throw userDataError
  })

  // Check if user data was returned (200)
  if ('id' in userRes) {
    user = userRes
    // If user was unauthorized (401), access token might be expired or invalid
  } else {
    // Update credentials (incl. cookies) using refresh token if no access token exists
    // (Throw if access token can't be fetched)
    ;({ accessToken, refreshToken } = await updateCredentials(refreshToken, event).catch(() => {
      throw unauthorizedError
    }))
    // Try fetching user data again, now that all tokens are up-to date
    // (Throw on any other status codes than 200 and 401)
    const userRes = await fetchUserData(accessToken).catch(() => {
      throw userDataError
    })
    // Check if user data was returned (200)
    if ('id' in userRes) {
      user = userRes
      // Otherwise throw final unauthorized error
    } else {
      throw unauthorizedError
    }
  }

  // Pass user info into context (for private procedures to use)
  return next({ ctx: { user, credentials: { ...ctx.credentials, accessToken, refreshToken } } })
})

/**
 * Procedure implementing the auth middleware.
 *
 * (Preferred way for routers to implement the middleware.)
 */
export const privateProcedure = publicProcedure.use(isAuthed)
