import { text, mysqlEnum, mysqlTable, mediumtext } from 'drizzle-orm/mysql-core'
import { nanoId } from '~/utils/nanoId/drizzle'
import { mimeTypes } from '~/utils/image'

/**
 * Drizzle schema for image.
 */
export default mysqlTable('image', {
  id: nanoId('id').primaryKey(),
  userId: text('user_id').notNull(),
  base64Blob: mediumtext('base64_blob').notNull(),
  mimeType: mysqlEnum('mime_type', mimeTypes).notNull(),
})
