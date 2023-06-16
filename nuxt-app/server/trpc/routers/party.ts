import { createInsertSchema } from 'drizzle-zod'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { customAlphabet } from 'nanoid'
import { TRPCError } from '@trpc/server'
import { publicProcedure, router } from '../trpc'
import { privateProcedure } from '../middleware/auth'
import { partyHostProcedure } from '../middleware/party'
import { spotifyRouter } from './spotify'
import { db } from '~/db'
import party, { sessionStatus } from '~/db/schema/party'
import image from '~/db/schema/image'
import { insertId, rowsAffected } from '~/server/utils/db'
import { partyCodeLength, partyCodeSchema } from '~/types/partySession'

// Create Zod schemas from drizzle schemas.
const partySchema = createInsertSchema(party).omit({
  id: true,
  userId: true,
  code: true,
  imageId: true,
  playlistId: true,
})
const imageSchema = createInsertSchema(image).omit({ id: true, userId: true })

/**
 * Create random party code.
 *
 * Code consists of 6 characters by default (all uppercase).
 *
 * (Uses NanoID)
 */
const generateRandomPartyCode = (length: number = partyCodeLength) => {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const nanoid = customAlphabet(alphabet, length)
  return nanoid()
}

/** Get id of party image if exists. */
const getPartyImageId = async (partyId: string, userId: string) => {
  return (
    (
      await db
        .select()
        .from(party)
        .where(and(eq(party.id, partyId), eq(party.userId, userId)))
    )[0]?.imageId ?? undefined
  )
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
      // Create new playlist to link to party
      // TODO: Add custom cover to playlist if image was supplied
      const spotify = spotifyRouter.createCaller(ctx)
      const playlist = await spotify.createPartyPlaylist(partyData)
      const playlistId = playlist.id
      // Create new party (and link image if it was created successfully)
      const { id, idOnSuccess } = insertId()
      const res = await db
        .insert(party)
        .values({ ...partyData, id, userId, code: generateRandomPartyCode(), playlistId, imageId: imageId ?? null })
      // Return party Id if it was created successfully
      return { id: idOnSuccess(res) }
    }),
  /** Update existing party (and image). (Throws if party does not exist or user is not owner of the party). */
  updateParty: partyHostProcedure
    .input(z.object({ data: z.object({ party: partySchema.partial(), image: imageSchema.optional() }) }))
    .mutation(async ({ ctx, input }) => {
      // Unpack input data
      const { party: partyData, image: imageData } = input.data
      const { id: partyId } = input
      const userId = ctx.user.id
      let imageId: string | undefined
      // Update image (if image data was provided)
      if (imageData) {
        // Get id of current party image if exists
        imageId = await getPartyImageId(partyId, userId)
        // If no image exists for current party, create new one and get its Id
        if (!imageId) {
          const { id, idOnSuccess } = insertId()
          // TODO: Check image size before inserting into DB!
          const insertImageRes = await db.insert(image).values({ ...imageData, id, userId })
          imageId = idOnSuccess(insertImageRes)
        } else {
          // Otherwise update the existing image
          // TODO: Check image size before updating DB!
          await db
            .update(image)
            .set(imageData)
            .where(and(eq(image.id, imageId), eq(image.userId, userId)))
        }
      }
      // Update party (and image Id if new image was created successfully)
      const res = await db
        .update(party)
        .set(imageData ? { ...partyData, imageId } : partyData)
        .where(and(eq(party.id, partyId), eq(party.userId, userId)))
      // Return party Id if update was successful
      return { id: rowsAffected(res) ? partyId : undefined }
    }),
  /** Get single party by id. (Throws if party does not exist or user is not owner of the party) */
  getParty: partyHostProcedure.query(({ ctx }) => {
    return ctx.party
  }),
  /** Get all parties for current user. */
  getUserParties: privateProcedure.query(async ({ ctx }) => {
    return await db.select().from(party).where(eq(party.userId, ctx.user.id))
  }),
  /** Get party using random party code. (Returns empty array if code does not exist) */
  getPartyByCode: publicProcedure.input(z.object({ code: partyCodeSchema })).query(async ({ input }) => {
    return (await db.select().from(party).where(eq(party.code, input.code)))[0]
  }),
  /** Delete party (Throws if party does not exist or user is not owner of the party). */
  deleteParty: partyHostProcedure.mutation(async ({ ctx, input }) => {
    const { id: partyId } = input
    // Delete associated image if exists
    const imageId = await getPartyImageId(input.id, ctx.user.id)
    if (imageId) {
      await db.delete(image).where(eq(image.id, imageId))
    }
    // Delete party itself
    const res = await db.delete(party).where(and(eq(party.id, partyId), eq(party.userId, ctx.user.id)))
    return { id: rowsAffected(res) ? partyId : undefined }
  }),
  checkPartyExists: publicProcedure.input(z.object({ code: partyCodeSchema })).query(async ({ input }) => {
    const partyRes = await db.select().from(party).where(eq(party.code, input.code))
    return { exists: partyRes.length > 0 }
  }),
  /** Update status of the party's live session (Throws if party does not exist or user is not owner of the party). */
  setSessionStatus: partyHostProcedure
    .input(z.object({ status: z.enum(sessionStatus) }))
    .mutation(async ({ input }) => {
      const { id: partyId, status } = input
      const res = await db.update(party).set({ sessionStatus: status }).where(eq(party.id, partyId))
      if (!rowsAffected(res))
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Could not update session status' })
      return { id: partyId }
    }),
})
