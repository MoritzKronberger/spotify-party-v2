/**
 * This is the entry point to set up the root configuration for tRPC on the server.
 * - `initTRPC` should only be used once per app.
 * - Only export the functionality that should be used to enforce which base procedures should be used
 *
 * Learn how to create protected base procedures and other things below:
 * @see https://trpc.io/docs/v10/router
 * @see https://trpc.io/docs/v10/procedures
 *
 * Reference: https://trpc-nuxt-docs.vercel.app/get-started/usage/recommended#1-create-a-trpc-router
 */
import { initTRPC } from '@trpc/server'
import { Context } from '~/server/trpc/context'

const t = initTRPC.context<Context>().create()

/** Unprotected procedure. **/
export const publicProcedure = t.procedure
export const router = t.router
export const middleware = t.middleware
