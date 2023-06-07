import { z } from 'zod'
import { InferModel, eq } from 'drizzle-orm'
import { createInsertSchema } from 'drizzle-zod'
import { decryptData, encryptData } from './crypto'
import tsFetch from '~/utils/tsFetch'
import { getAuthHeader } from '~/server/utils/pkce'
import user from '~/db/schema/user'
import { db } from '~/db'
import { genNanoId } from '~/utils/nanoId'
import { nanoId } from '~~/utils/nanoId/zod'

export type PrivateUser = InferModel<typeof user>
export type User = Omit<PrivateUser, 'accessToken' | 'refreshToken'>
export type SpotifyUser = Omit<User, 'id'>

/** Zod schema for public user data. */
export const userSchema = createInsertSchema(user)
  .omit({ accessToken: true, refreshToken: true })
  .merge(z.object({ id: nanoId() }))

/**
 * User data as returned by the Spotify API.
 *
 * Reference:
 * https://developer.spotify.com/documentation/web-api/reference/get-current-users-profile
 */
export const spotifyUserSchema = z.object({
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
export const spotifyUserUnauthorizedSchema = z.object({ error: z.object({ status: z.number(), message: z.string() }) })

/** Fetch user data from Spotify API. */
export const fetchUserDataFromSpotify = async (accessToken: string): Promise<SpotifyUser | undefined> => {
  const spotifyUser = await tsFetch(
    'https://api.spotify.com/v1/me',
    { 200: spotifyUserSchema, 401: spotifyUserUnauthorizedSchema },
    { headers: getAuthHeader(accessToken) }
  )

  if (!('id' in spotifyUser)) return undefined

  return {
    spotifyId: spotifyUser.id,
    name: spotifyUser.display_name,
    email: spotifyUser.email,
  }
}

const { env } = process

/** Encrypt the user's Spotify credentials with AES. */
export const encryptUserCredentials = (accessToken: string, refreshToken: string) => {
  return {
    accessToken: encryptData(accessToken, env.CRYPTO_USER_KEY, env.CRYPTO_USER_IV),
    refreshToken: encryptData(refreshToken, env.CRYPTO_USER_KEY, env.CRYPTO_USER_IV),
  }
}

/** Decrypt the user's Spotify credentials with AES. */
export const decryptUserCredentials = (encryptedAccessToken: string, encryptedRefreshToken: string) => {
  return {
    accessToken: decryptData(encryptedAccessToken, env.CRYPTO_USER_KEY, env.CRYPTO_USER_IV),
    refreshToken: decryptData(encryptedRefreshToken, env.CRYPTO_USER_KEY, env.CRYPTO_USER_IV),
  }
}

/**
 * Get user data.
 *
 * Get user data without credentials (should be used in most cases).
 */
export const getUserDataFromDB = async (spotifyUserId: string): Promise<User | undefined> => {
  const privateUserData = (await db.select().from(user).where(eq(user.spotifyId, spotifyUserId)))[0]
  if (!privateUserData) return undefined
  return {
    id: privateUserData.id,
    spotifyId: privateUserData.spotifyId,
    name: privateUserData.name,
    email: privateUserData.email,
  }
}

/**
 * Get private user data.
 *
 * Includes decrypted Spotify credentials.
 *
 * SHOULD ONLY BE USED IF CREDENTIALS ARE ACTUALLY NEEDED!.
 */
export const getPrivateUserDataFromDB = async (userId: string): Promise<PrivateUser | undefined> => {
  const privateUserData = (await db.select().from(user).where(eq(user.id, userId)))[0]
  if (!privateUserData) return undefined
  const decryptedCredentials = decryptUserCredentials(privateUserData.accessToken, privateUserData.refreshToken)
  return { ...privateUserData, ...decryptedCredentials }
}

/**
 * Update credentials for user in database.
 *
 * Encrypts access token and refresh token.
 */
export const updateUserCredentials = async (spotifyUserId: string, accessToken: string, refreshToken: string) => {
  const encryptedCredentials = encryptUserCredentials(accessToken, refreshToken)
  await db.update(user).set(encryptedCredentials).where(eq(user.spotifyId, spotifyUserId))
  return getUserDataFromDB(spotifyUserId)
}

/**
 * Insert new user into database.
 *
 * Encrypts access token and refresh token.
 */
export const upsertUser = async (userData: SpotifyUser, accessToken: string, refreshToken: string) => {
  const existingUser = (await db.select().from(user).where(eq(user.spotifyId, userData.spotifyId)))[0]
  if (existingUser) {
    return updateUserCredentials(existingUser.spotifyId, accessToken, refreshToken)
  } else {
    const encryptedCredentials = encryptUserCredentials(accessToken, refreshToken)
    await db.insert(user).values({ ...userData, ...encryptedCredentials, id: genNanoId() })
    return await getUserDataFromDB(userData.spotifyId)
  }
}
