import { TRPCError } from '@trpc/server'
import { middleware, publicProcedure } from '../trpc'
import { verifyJWT } from '~/server/auth'

/**
 * Authentication middleware.
 *
 * - Verifies JWT containing user data
 * - Passes user data into tRPC context
 *
 * Reference:
 * https://trpc.io/docs/v9/middlewares
 */
const isAuthed = middleware(({ next, ctx }) => {
  const { jwt } = ctx.credentials

  const unauthorizedError = new TRPCError({ code: 'UNAUTHORIZED' })

  // Throw if JWT is missing
  if (!jwt) throw unauthorizedError

  const user = verifyJWT(jwt)

  // Throw if JWT could not be verified
  if (!user) throw unauthorizedError

  // Pass user info into context (for private procedures to use)
  return next({ ctx: { user } })
})

/**
 * Procedure implementing the auth middleware.
 *
 * (Preferred way for routers to implement the middleware.)
 */
export const privateProcedure = publicProcedure.use(isAuthed)
