import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { privateProcedure } from './auth'
import { nanoId } from '~/utils/nanoId/zod'
import partyTable from '~/db/schema/party'
import { db } from '~/db'

/**
 * Procedure implementing `auth` middleware.
 *
 * Ensures that user is host of specified party (and that party exists).
 */
export const partyHostProcedure = privateProcedure
  .input(z.object({ id: nanoId() }))
  .use(async ({ next, ctx, input }) => {
    const { id: partyId } = input
    const { user } = ctx
    const party = (await db.select().from(partyTable).where(eq(partyTable.id, input.id)))[0]

    if (!party) throw new TRPCError({ code: 'NOT_FOUND', message: `No party exists for id ${partyId}` })
    if (party.userId !== user.id) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User is not party host' })

    return next({
      ctx: {
        party,
      },
    })
  })
