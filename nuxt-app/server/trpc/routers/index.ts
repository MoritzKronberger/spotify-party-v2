import { router } from '../trpc'
import { songsRouter } from './songs'
import { authRouter } from './auth'
import { partyRouter } from './party'
import { sessionRouter } from './session'
import { spotifyRouter } from './spotify'
import { imageRouter } from './image'

/** Bundle sub-routers for entire application. */
export const appRouter = router({
  auth: authRouter,
  songs: songsRouter,
  image: imageRouter,
  party: partyRouter,
  session: sessionRouter,
  spotify: spotifyRouter,
})

/** API type definition. */
export type AppRouter = typeof appRouter
