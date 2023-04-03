import { z } from 'zod'
import { publicProcedure, router } from '../trpc'

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string().nullish(),
        timestamp: z.date().nullish(),
      })
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input?.text ?? 'world'}`,
        timestamp: input.timestamp ?? new Date(),
      }
    }),
})

/** API type definition. */
export type AppRouter = typeof appRouter
