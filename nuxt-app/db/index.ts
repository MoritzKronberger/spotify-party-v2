import { drizzle } from 'drizzle-orm/planetscale-serverless'
import { connect } from '@planetscale/database'

const { env } = process

/**
 * Connect to DB using the PlanetScale serverless driver
 *
 * Reference:
 * https://planetscale.com/blog/introducing-the-planetscale-serverless-driver-for-javascript
 */
const connection = connect({
  host: env.DATABASE_HOST,
  username: env.DATABASE_USERNAME,
  password: env.DATABASE_PASSWORD,
})

/**
 * Drizzle DB connection to PlanetScale serverless driver
 *
 * Reference:
 * https://github.com/drizzle-team/drizzle-orm/blob/main/drizzle-orm/src/mysql-core/README.md#connect-using-planetscale-serverless-client
 */
export const db = drizzle(connection)
