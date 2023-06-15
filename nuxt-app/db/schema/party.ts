import { text, timestamp, varchar, mysqlTable, int } from 'drizzle-orm/mysql-core'
import { nanoId } from '~/utils/nanoId/drizzle'
import { partyCodeLength } from '~/types/partySession'

/**
 * Drizzle schema for party.
 */
export default mysqlTable('party', {
  id: nanoId('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  description: text('description'), // NULLABLE
  startAutomatically: timestamp('start_automatically'), // NULLABLE: no timestamp = manual start
  code: varchar('code', { length: partyCodeLength }).notNull(),
  tokenCount: int('token_count').notNull().default(0),
  playlistId: text('playlist_id').notNull(),
  imageId: nanoId('image_id'), // NULLABLE, no FKs in PlanetScale: TODO add index?
})
