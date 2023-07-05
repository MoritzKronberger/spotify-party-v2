import { createInsertSchema } from 'drizzle-zod'
import { desc } from 'drizzle-orm'
import { publicProcedure, router } from '../trpc'
import { db } from '~/db'
import { songs } from '~/db/schema'

/**
 * Create Zod schema from drizzle schema.
 *
 * Reference:
 * https://github.com/drizzle-team/drizzle-orm/tree/main/drizzle-zod
 */
const songSchema = createInsertSchema(songs).omit({ id: true })

export const songsRouter = router({
  addSong: publicProcedure.input(songSchema).mutation(async ({ input }) => {
    const { name, createdAt } = input
    return await db.insert(songs).values({ name, createdAt: createdAt ?? new Date() })
  }),
  getSongs: publicProcedure.query(async () => {
    return await db.select().from(songs).orderBy(desc(songs.createdAt))
  }),
})
