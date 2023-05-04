// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // Configure tRPC Nuxt
  // Reference: https://trpc-nuxt-docs.vercel.app/get-started/installation
  build: {
    transpile: ['trpc-nuxt', 'vuetify', '@vuepic/vue-datepicker'],
  },
  // Use Vuetify-main and mdi-icon styles
  // Reference: https://codybontecou.com/how-to-use-vuetify-with-nuxt-3.html
  css: ['vuetify/lib/styles/main.css', '@mdi/font/css/materialdesignicons.min.css'],
})
