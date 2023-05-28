import { router } from '../trpc'
import { songsRouter } from './songs'
import { authRouter } from './auth'
import { partyRouter } from './party'
import { sessionRouter } from './session'

/** Bundle sub-routers for entire application. */
export const appRouter = router({
  auth: authRouter,
  songs: songsRouter,
  party: partyRouter,
  session: sessionRouter,
})

/** API type definition. */
export type AppRouter = typeof appRouter
