import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { publicProcedure } from '../trpc'
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

  return next({ ctx: { party: session } })
})
