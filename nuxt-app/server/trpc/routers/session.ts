import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { nanoId } from '~/utils/nanoId/zod'
import { messageSchema, userSchema } from '~/types/partySession'
import { PartySession } from '~/server/utils/partySession'

const sessionSchema = z.object({
  sessionCode: nanoId,
})

export const sessionRouter = router({
  /** Join party session with user. */
  join: publicProcedure.input(z.object({ user: userSchema, session: sessionSchema })).mutation(({ input }) => {
    const { user, session } = input
    const kvSession = new PartySession(session.sessionCode)
    return kvSession.addUser(user)
  }),
  /** Add message to party session. */
  addMessage: publicProcedure
    .input(z.object({ session: sessionSchema, message: messageSchema }))
    .mutation(({ input }) => {
      const { session, message } = input
      const kvSession = new PartySession(session.sessionCode)
      return kvSession.addMessage(message)
    }),
})
