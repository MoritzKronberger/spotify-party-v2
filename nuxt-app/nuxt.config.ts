// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Configure tRPC Nuxt
  // Reference: https://trpc-nuxt-docs.vercel.app/get-started/installation
  build: {
    transpile: ['trpc-nuxt'],
  },
})
