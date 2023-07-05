import { ExecutedQuery } from '@planetscale/database'
import { genNanoId } from '~/utils/nanoId'

/** Check if rows were affected by DB query. */
export const rowsAffected = (res: ExecutedQuery) => res.rowsAffected > 0

/**
 * Helper function for returning Ids on DB inserts.
 *
 * Creates NanoID and helper function to return it on success.
 */
export const insertId = () => {
  const id = genNanoId()
  return {
    id,
    idOnSuccess: (res: ExecutedQuery) => (rowsAffected(res) ? id : undefined),
  }
}
