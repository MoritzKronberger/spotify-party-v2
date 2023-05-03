import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { customAlphabet } from 'nanoid'
import { router } from '../trpc'
import { privateProcedure } from '../middleware/auth'
import { db } from '~/db'
import party from '~/db/schema/party'
import image from '~/db/schema/image'
import { insertId } from '~/server/utils/db'

// Create Zod schemas from drizzle schemas.
const partySchema = createInsertSchema(party).omit({ id: true, userId: true, code: true, imageId: true })
const imageSchema = createInsertSchema(image).omit({ id: true, userId: true })

/**
 * Create random party code.
 *
 * Code consists of 6 characters (all uppercase).
 *
 * (Uses NanoID)
 */
const generateRandomPartyCode = () => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const nanoid = customAlphabet(alphabet, 6)
  return nanoid()
}

export const partyRouter = router({
  /** Create new party (and image). */
  createParty: privateProcedure
    .input(z.object({ party: partySchema, image: imageSchema.optional() }))
    .mutation(async ({ ctx, input }) => {
      // Unpack input data
      const { party: partyData, image: imageData } = input
      const userId = ctx.user.id
      // Create image (if image data was provided)
      let imageId: string | undefined
      if (imageData) {
        const { id, idOnSuccess } = insertId()
        // TODO: Check image size before inserting into DB!
        const res = await db.insert(image).values({ ...imageData, id, userId })
        imageId = idOnSuccess(res)
      }
      // Create new party (and link image if it was created successfully)
      const { id, idOnSuccess } = insertId()
      const res = await db.insert(party).values({ ...partyData, id, userId, code: generateRandomPartyCode(), imageId })
      // Return party Id if it was created successfully
      return idOnSuccess(res)
    }),
})
