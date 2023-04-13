import { ThemeDefinition, createVuetify } from 'vuetify/lib/framework.mjs'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

/**
 * Custom Vuetify theme.
 *
 * Reference:
 * https://vuetifyjs.com/en/features/theme/#typescript
 */
const customTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#000000',
    surface: '#000000',
    primary: '#1DB954',
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  /**
   * Basic Vuetify setup for Nuxt 3
   *
   * Reference:
   * https://codybontecou.com/how-to-use-vuetify-with-nuxt-3.html
   */
  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: 'customTheme',
      themes: {
        customTheme,
      },
    },
    /**
     * Configure global and component defaults.
     *
     * Reference:
     * https://vuetifyjs.com/en/features/global-configuration/#global-configuration
     */
    defaults: {
      global: {
        rounded: 'x-large',
      },
      VBtn: {
        color: 'primary',
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
