import type { Config } from 'drizzle-kit'
import 'dotenv/config'

const { env } = process

/**
 * Configuration for Drizzle `db-push`.
 *
 * Reference:
 * https://github.com/drizzle-team/drizzle-orm/blob/db-push-docs/docs/db-push.preview.md
 */
export default {
  // Use connection string to enable SSL
  connectionString: `mysql://${env.DATABASE_USERNAME}:${env.DATABASE_PASSWORD}@${env.DATABASE_HOST}/${env.DATABASE_NAME}?ssl={"rejectUnauthorized":true}`,
  schema: './db/schema',
} satisfies Config
