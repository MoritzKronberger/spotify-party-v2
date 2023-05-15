import { text, mysqlEnum, mysqlTable } from 'drizzle-orm/mysql-core'
import { nanoId } from '~/utils/nanoId/drizzle'

/**
 * Drizzle schema for image.
 */
export default mysqlTable('image', {
  id: nanoId('id').primaryKey(),
  userId: text('user_id').notNull(),
  base64Blob: text('base64_blob').notNull(),
  mimeType: mysqlEnum('mime_type', ['image/jpeg', 'image/jpg', 'image/png']).notNull(),
})
