import { z } from 'zod'

/** Zod schema for NanoID format. */
export const nanoId = z
  .string()
  .length(12)
  // Regex that matches lower case alphanumeric characters
  .refine((value) => /^[a-z0-9]+$/.test(value), 'NanoID must respect custom alphabet: a-z0-9')
