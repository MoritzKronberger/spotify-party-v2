import { z } from 'zod'

/**
 * Zod schema for NanoID format.
 *
 * Application-wide default length = 12.
 */
export const nanoId = (length = 12) =>
  z
    .string()
    .length(length)
    // Regex that matches lower case alphanumeric characters
    .refine((value) => /^[a-z0-9]+$/.test(value), 'NanoID must respect custom alphabet: a-z0-9')
