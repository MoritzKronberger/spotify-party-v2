import { mysqlEnum, mysqlTable, mediumtext, index } from 'drizzle-orm/mysql-core'
import { nanoId } from '~/utils/nanoId/drizzle'
import { mimeTypes } from '~/utils/image'

/**
 * Drizzle schema for image.
 */
export default mysqlTable(
  'image',
  {
    id: nanoId('id').primaryKey(),
    userId: nanoId('user_id').notNull(),
    base64Blob: mediumtext('base64_blob').notNull(),
    mimeType: mysqlEnum('mime_type', mimeTypes).notNull(),
  },
  (image) => ({
    userIndex: index('user_index').on(image.userId),
  })
)
