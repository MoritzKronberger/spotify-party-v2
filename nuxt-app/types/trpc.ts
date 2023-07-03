import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~/server/trpc/routers'

type RouterInputs = inferRouterInputs<AppRouter>
type RouterOutputs = inferRouterOutputs<AppRouter>
export type Party = RouterOutputs['party']['getParty']
export type Playlist = RouterOutputs['spotify']['getPlaylist']
export type SessionStatus = RouterInputs['party']['setSessionStatus']['status']
export type Playback = RouterOutputs['spotify']['getPlayback']
