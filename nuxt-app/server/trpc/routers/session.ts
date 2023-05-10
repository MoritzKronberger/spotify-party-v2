import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { messageSchema, partyCodeSchema } from '~/types/partySession'
import { PartySession } from '~/server/utils/partySession'

const sessionSchema = z.object({
  sessionCode: partyCodeSchema,
})

export const sessionRouter = router({
  /** Add message to party session. */
  addMessage: publicProcedure
    .input(z.object({ session: sessionSchema, message: messageSchema }))
    .mutation(({ input }) => {
      const { session, message } = input
      const kvSession = new PartySession(session.sessionCode)
      return kvSession.addMessage(message)
    }),
})
