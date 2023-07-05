import { ThemeDefinition, createVuetify } from 'vuetify/lib/framework.mjs'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VBtn, VCard } from 'vuetify/components'

/**
 * Custom Vuetify theme.
 *
 * Reference:
 * https://vuetifyjs.com/en/features/theme/#typescript
 */
const defaultTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#000000',
    surface: '#1c1b1b',
    primary: '#17AE69',
    secondary: '#FFFFFF',
    spotify: '#1DB954',
    openAI: '#10A37F',
  },
}

const wireframesTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#000000',
    surface: '#1c1b1b',
    primary: '#17AE69',
    secondary: '#FFFFFF',
    spotify: '#1DB954',
    openAI: '#10A37F',
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
      defaultTheme: 'defaultTheme',
      themes: {
        defaultTheme,
        wireframesTheme,
      },
    },
    /**
     * Configure component aliases
     *
     * Reference:
     * https://vuetifyjs.com/en/features/aliasing
     */
    aliases: {
      ButtonPrimary: VBtn,
      ButtonSecondary: VBtn,
      PlaceholderCard: VCard,
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
        elevation: 0,
      },
      ButtonPrimary: {
        color: 'primary',
        variant: 'flat',
        block: true,
      },
      ButtonSecondary: {
        color: 'secondary',
        variant: 'outlined',
        block: true,
      },
      PlaceholderCard: {
        color: 'secondary',
        variant: 'outlined',
        title: 'Placeholder',
      },
      VTextField: {
        variant: 'outlined',
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
