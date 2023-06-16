import { z } from 'zod'

// Load env var using environment specific method
const maxSpotifyImageSizeKB = process.client
  ? useRuntimeConfig().public.SPOTIFY_MAX_IMG_SIZE_KB
  : process.env.SPOTIFY_MAX_IMG_SIZE_KB

/**
 * Maximum length for MySQL text columns.
 *
 * Reference:
 * https://dev.mysql.com/doc/refman/8.0/en/string-type-syntax.html
 */
export const maxMySQLBlobLength = 65_535

/**
 * Ensure blob doesn't exceed maximum length of MySQL text column.
 *
 * Reference:
 * https://dev.mysql.com/doc/refman/8.0/en/string-type-syntax.html
 */
export const base64BlobSchema = z.string().max(maxMySQLBlobLength)

/**
 * Maximum custom playlist cover size supported by Spotify Web API.
 *
 * Reference:
 * https://developer.spotify.com/documentation/web-api/reference/upload-custom-playlist-cover
 */
export const maxImageSizeKB = +(maxSpotifyImageSizeKB ?? 100)

/**
 * Only allow JPEG images in DB as it's the only mimetype supported by Spotify Web API.
 *
 * Reference:
 * https://developer.spotify.com/documentation/web-api/reference/upload-custom-playlist-cover
 */
export const mimeTypes = ['image/jpeg'] as const

export type MimeType = (typeof mimeTypes)[number]
