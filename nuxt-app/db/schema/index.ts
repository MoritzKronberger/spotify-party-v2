import image from './image'
import party from './party'
import user from './user'

/**
 * Register all schema components by exporting them from here.
 * (For compatibility with Drizzle `db-push`)
 * (Migrations did not yet exist when starting the project)
 *
 * References:
 * - https://orm.drizzle.team/kit-docs/overview#prototyping-with-db-push
 * - https://orm.drizzle.team/kit-docs/overview#migration-files
 */
export { image, party, user }
