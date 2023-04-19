import { z } from 'zod'

/**
 * Typesafe fetch util.
 *
 * Validates response data using Zod schema for the given response status code.
 *
 * Throws for validation errors and unexpected status codes.
 *
 * Reference (Zod + Generics):
 * https://github.com/colinhacks/zod#writing-generic-functions
 */
export default async <TResponseSchema extends z.ZodTypeAny>(
  url: URL | string,
  responseSchemas: { [statusCode: number]: TResponseSchema },
  opts?: RequestInit
): Promise<z.infer<TResponseSchema>> => {
  // Set default options for fetch
  const defaultOpts: RequestInit = {
    method: 'get',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
  }
  // Fetch and JSON parse response data
  const response = await fetch(url, { ...defaultOpts, ...opts })
  // TODO: Catch JSON-Parse errors
  const data = await response.json()
  // Get schema for given status code
  const { status } = response
  const schema = responseSchemas[status]
  // Throw if no schema was provided for status code
  if (!schema) throw new Error(`No schema provided for status code ${status} on fetch ${url}`)
  // Return parsed (-> typesafe) data
  return schema.parse(data)
}
