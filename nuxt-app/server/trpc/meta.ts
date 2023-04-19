import { ResponseMetaFn } from 'trpc-nuxt'
import { AppRouter } from './routers'

/**
 * Hack for adding response headers returned from procedures via tRPC context.
 *
 * Reference: https://trpc.io/docs/v9/caching
 */
export const responseMeta: ResponseMetaFn<AppRouter> = ({ ctx }) => {
  // Convert headers to dict
  const headersObj = ctx ? Object.fromEntries(ctx.contextHeaders.entries()) : undefined
  // Pass context headers (set by tRPC procedures)
  return {
    headers: headersObj,
  }
}
