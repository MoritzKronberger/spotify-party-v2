import { router } from '../trpc'
import { songsRouter } from './songs'
import { authRouter } from './auth'
import { partyRouter } from './party'

/** Bundle sub-routers for entire application. */
export const appRouter = router({
  auth: authRouter,
  songs: songsRouter,
  party: partyRouter,
})

/** API type definition. */
export type AppRouter = typeof appRouter
