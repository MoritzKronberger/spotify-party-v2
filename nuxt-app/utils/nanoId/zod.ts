import { z } from 'zod'

/**
 * Zod schema for NanoID format.
 *
 * Application-wide default: length=12, regex=/^[a-z0-9]+$/.
 */
export const nanoId = (length = 12, regex = /^[a-z0-9]+$/) =>
  z
    .string()
    .length(length)
    // Regex that matches lower case alphanumeric characters
    .refine((value) => regex.test(value), 'NanoID must respect custom alphabet: a-z0-9')
