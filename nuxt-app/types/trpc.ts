import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~/server/trpc/routers'

type RouterInputs = inferRouterInputs<AppRouter>
type RouterOutputs = inferRouterOutputs<AppRouter>
export type MimeType = NonNullable<RouterInputs['party']['createParty']['image']>['mimeType']
export type Party = RouterOutputs['party']['getParty'][number]
