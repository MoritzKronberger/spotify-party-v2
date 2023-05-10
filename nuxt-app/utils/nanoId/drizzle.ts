import { customType } from 'drizzle-orm/mysql-core/columns/index.js'
import { nanoId as nanoIdSchema } from './zod'

/**
 * Custom Drizzle column for NanoID.
 *
 * Reference:
 * https://github.com/drizzle-team/drizzle-orm/blob/main/docs/custom-types.lite.md
 */
export const nanoId = customType<{ data: string }>({
  dataType() {
    return 'varchar(12)'
  },
  toDriver(value) {
    return nanoIdSchema().parse(value)
  },
})
