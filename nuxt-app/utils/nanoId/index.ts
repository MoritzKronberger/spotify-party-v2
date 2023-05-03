import { customAlphabet } from 'nanoid'

/** Reduced alphabet for custom NanoIDs. */
const nanoIDAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz'
const customNanoid = customAlphabet(nanoIDAlphabet, 12)

/**
 * Generate NanoID.
 *
 * Generates random 12-character alphanumeric string.
 *
 * Why use NanoIDs instead of UUIDs?
 * - Shorter
 * - Can be selected via double-click
 * - 1% probability of collision when generating 1000 Ids per hour for 35 years
 *
 * References:
 * - https://planetscale.com/blog/why-we-chose-nanoids-for-planetscales-api
 * - https://github.com/ai/nanoid
 */
export const genNanoId = () => {
  return customNanoid(12)
}
