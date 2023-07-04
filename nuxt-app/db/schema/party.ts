import { text, varchar, mysqlTable, int, mysqlEnum, index } from 'drizzle-orm/mysql-core'
import { nanoId } from '~/utils/nanoId/drizzle'
import { partyCodeLength } from '~/types/partySession'

export const sessionStatus = ['inactive', 'active', 'closed'] as const

/**
 * Drizzle schema for party.
 */
export default mysqlTable(
  'party',
  {
    id: nanoId('id').primaryKey(),
    userId: nanoId('user_id').notNull(), // No FKs in PlanetScale -> index column
    name: text('name').notNull(),
    description: text('description'), // NULLABLE
    code: varchar('code', { length: partyCodeLength }).notNull(),
    tokenCount: int('token_count').notNull().default(0),
    playlistId: text('playlist_id').notNull(), // Only refers to Id in Spotify-API not a table!
    sessionStatus: mysqlEnum('session_status', sessionStatus).notNull().default('inactive'),
    imageId: nanoId('image_id'), // NULLABLE, no FKs in PlanetScale -> index column
  },
  (party) => ({
    userIndex: index('user_index').on(party.userId),
    imageIndex: index('image_index').on(party.imageId),
  })
)
