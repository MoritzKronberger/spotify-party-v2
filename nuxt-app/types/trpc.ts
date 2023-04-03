import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { AppRouter } from '~~/server/trpc/routers'

type RouterInputs = inferRouterInputs<AppRouter>
type RouterOutputs = inferRouterOutputs<AppRouter>

export type helloInput = RouterInputs['hello']
export type helloOutput = RouterOutputs['hello']
