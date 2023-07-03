import { z } from 'zod'

// Load env var using environment specific method
const maxSpotifyImageSizeKB = process.client
  ? useRuntimeConfig().public.SPOTIFY_MAX_IMG_SIZE_KB
  : process.env.SPOTIFY_MAX_IMG_SIZE_KB

/**
 * Maximum length for MySQL mediumtext columns.
 *
 * Reference:
 * https://chartio.com/resources/tutorials/understanding-strorage-sizes-for-mysql-text-data-types/
 */
export const maxMySQLMediumTextLength = 16_777_215

/**
 * Ensure blob doesn't exceed maximum length of MySQL mediumtext column.
 *
 * Reference:
 * https://chartio.com/resources/tutorials/understanding-strorage-sizes-for-mysql-text-data-types/
 */
export const base64BlobSchema = z.string().max(maxMySQLMediumTextLength)

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
