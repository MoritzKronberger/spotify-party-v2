import { z } from 'zod'
import { publicProcedure, router } from '../trpc'
import { userMessageSchema, partyCodeSchema } from '~/types/partySession'
import { PartySession } from '~/server/utils/partySession'
import { genNanoId } from '~~/utils/nanoId'
import { openAIClient } from '~/openaiClient'

const sessionSchema = z.object({
  sessionCode: partyCodeSchema,
})

export const sessionRouter = router({
  /** Add message to party session. */
  addMessage: publicProcedure
    .input(z.object({ session: sessionSchema, message: userMessageSchema.omit({ id: true }) }))
    .mutation(async ({ input }) => {
      // Unpack inputs
      const { session, message } = input
      // Create new party session helper
      const partySession = new PartySession(session.sessionCode)

      // If message is first message in session, prepend system message
      const messages = (await partySession.getMessages()) ?? []
      if (messages.length === 0) {
        const systemMessage = {
          role: 'system' as const,
          content: openAIClient.systemMessage,
        }
        await partySession.addMessage(systemMessage)
      }

      // Format message for OpenAI chat API
      const fullMessage = partySession.formatUserMessage({ ...message, id: genNanoId() }, 'user')
      // Add message to party session
      const sessionMessages = await partySession.addMessage(fullMessage)

      const promptMessages = partySession.publicFormatPromptMessages(sessionMessages)
      const playlist = await openAIClient.getPlaylist(promptMessages)
      console.log(playlist)

      // Publish new message list (optimistic update)
      partySession.publishMessages(sessionMessages)
    }),
})
