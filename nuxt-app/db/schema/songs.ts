import { serial, text, timestamp } from 'drizzle-orm/mysql-core/columns'
import { mysqlTable } from 'drizzle-orm/mysql-core/table'

/**
 * Basic Drizzle schema.
 *
 * Reference:
 * https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/mysql-core/README.md#quick-start
 */
export default mysqlTable('songs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').notNull(),
})
