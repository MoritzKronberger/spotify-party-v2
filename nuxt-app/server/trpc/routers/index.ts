import { router } from '../trpc'
import { songsRouter } from './songs'
import { authRouter } from './auth'

/** Bundle sub-routers for entire application. */
export const appRouter = router({
  auth: authRouter,
  songs: songsRouter,
})

/** API type definition. */
export type AppRouter = typeof appRouter
