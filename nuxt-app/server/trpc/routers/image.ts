import { createInsertSchema } from 'drizzle-zod'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { privateProcedure } from '../middleware/auth'
import { router } from '../trpc'
import { image } from '~/db/schema'
import { db } from '~/db'
import { nanoId } from '~/utils/nanoId/zod'
import { maxImageSizeKB, base64BlobSchema } from '~/utils/image'

export const imageSchema = createInsertSchema(image)
  .omit({ id: true, userId: true })
  .merge(z.object({ base64Blob: base64BlobSchema }))

export const imageRouter = router({
  /**
   * Save new image to DB.
   *
   * Throws if image exceeds maximum image size
   *
   * This could be greatly improved by:
   * - Cropping images to be square
   * - Auto-compressing images
   * - Auto-converting images to JPEG
   * - etc.
   *
   * However, the current image storage (as base64-blobs in the DB) is a temporary workaround
   * until Vercel Blob Storage is available (https://vercel.com/docs/storage/vercel-blob#),
   * which is why everything is kept as simple as possible for now.
   */
  createImage: privateProcedure.input(imageSchema).mutation(async ({ input, ctx }) => {
    const { base64Blob } = input

    // Throw if image size exceeds Spotify's maximum image size for custom playlist covers
    // Reference: https://developer.spotify.com/documentation/web-api/reference/upload-custom-playlist-cover
    const imageSizeKB = Buffer.byteLength(base64Blob) / 1024
    if (imageSizeKB > maxImageSizeKB)
      throw new TRPCError({
        code: 'PAYLOAD_TOO_LARGE',
        message: `Base64 image size of ${imageSizeKB} KB exceeds maximum image size of ${maxImageSizeKB} KB`,
      })

    // Save JPEG image to DB
    const { id, idOnSuccess } = insertId()
    const res = await db.insert(image).values({ ...input, id, userId: ctx.user.id })
    return idOnSuccess(res)
  }),
  /** Delete image from DB. */
  deleteImage: privateProcedure.input(z.object({ imageId: nanoId() })).mutation(async ({ ctx, input }) => {
    const { imageId } = input
    if (ctx.user.id !== imageId) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User is not owner of image.' })
    const res = await db.delete(image).where(eq(image.id, imageId))
    return { id: rowsAffected(res) ? imageId : undefined }
  }),
})
