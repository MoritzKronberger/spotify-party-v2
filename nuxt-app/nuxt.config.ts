// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Configure tRPC Nuxt
  // Reference: https://trpc-nuxt-docs.vercel.app/get-started/installation
  build: {
    transpile: ['trpc-nuxt', 'vuetify'],
  },
  // Use Vuetify styles
  // Reference: https://codybontecou.com/how-to-use-vuetify-with-nuxt-3.html
  // css: ['vuetify/lib/styles/main.sass'],
})
