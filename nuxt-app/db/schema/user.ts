import { mysqlTable, text, uniqueIndex } from 'drizzle-orm/mysql-core'
import { nanoId } from '~/utils/nanoId/drizzle'

/** Drizzle schema for Spotify user. */
export default mysqlTable(
  'user',
  {
    id: nanoId('id').primaryKey(),
    spotifyId: text('spotify_id').notNull(), // UNIQUE (index column)
    name: text('name').notNull(),
    email: text('e_mail').notNull(), // UNIQUE (index column)
    accessToken: text('access_token'), // NULLABLE
    refreshToken: text('refresh_token'), // NULLABLE
  },
  (user) => ({
    uniqueSpotifyId: uniqueIndex('unique_spotify_id').on(user.spotifyId),
    uniqueEMail: uniqueIndex('unique_e_mail').on(user.email),
  })
)
