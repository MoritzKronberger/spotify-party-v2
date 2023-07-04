import { mysqlTable, text } from 'drizzle-orm/mysql-core'
import { nanoId } from '~/utils/nanoId/drizzle'

/** Drizzle schema for Spotify user. */
export default mysqlTable('user', {
  id: nanoId('id').primaryKey(),
  spotifyId: text('spotify_id').notNull(), // Unique is not yet implemented for Drizzle ORM!
  name: text('name').notNull(),
  email: text('e_mail').notNull(), // Unique is not yet implemented for Drizzle ORM!
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
})
