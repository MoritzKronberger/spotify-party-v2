import { text, mysqlEnum, mysqlTable } from 'drizzle-orm/mysql-core'
import { nanoId } from '~/utils/nanoId/drizzle'

export const mimeTypes = ['image/jpeg', 'image/jpg', 'image/png'] as const

/**
 * Drizzle schema for image.
 */
export default mysqlTable('image', {
  id: nanoId('id').primaryKey(),
  userId: text('user_id').notNull(),
  base64Blob: text('base64_blob').notNull(),
  mimeType: mysqlEnum('mime_type', mimeTypes).notNull(),
})
