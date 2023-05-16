import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~/server/trpc/routers'

type RouterInputs = inferRouterInputs<AppRouter>
type RouterOutputs = inferRouterOutputs<AppRouter>
export type SongInput = RouterInputs['addSong']
export type Song = RouterOutputs['getSongs'][number]
export type MimeType = NonNullable<RouterInputs['party']['createParty']['image']>['mimeType']
