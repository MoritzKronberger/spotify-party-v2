import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { publicProcedure } from '../trpc'
import { privateProcedure } from './auth'
import { PartySession } from '~/server/utils/partySession'
import { partyCodeSchema } from '~/types/partySession'
import { db } from '~/db'
import { party } from '~/db/schema'

const sessionSchema = z.object({
  session: z.object({
    sessionCode: partyCodeSchema,
  }),
})

/**
 * Procedure implementing isSession middleware.
 *
 * Check if party exists for given session code.
 */
export const sessionProcedure = publicProcedure.input(sessionSchema).use(async ({ next, input }) => {
  const { sessionCode } = input.session
  const res = await db.select().from(party).where(eq(party.code, sessionCode))
  const session = res[0]

  if (!session) throw new TRPCError({ code: 'NOT_FOUND', message: `No party exists for code ${sessionCode}` })

  const partySession = new PartySession(sessionCode)

  return next({ ctx: { party: session, partySession } })
})

/**
 * Procedure implementing the `auth` and `isSession` middleware.
 *
 * Ensures that user is host of specified party session.
 */
export const sessionHostProcedure = privateProcedure.unstable_concat(sessionProcedure).use(({ next, ctx }) => {
  const { user, party } = ctx

  // Throw if user is not creator of party (= host of session)
  if (user.id !== party.userId)
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User ist not host of party session' })

  return next()
})
