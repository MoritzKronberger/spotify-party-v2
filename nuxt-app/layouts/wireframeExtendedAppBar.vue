<template>
  <v-theme-provider theme="wireframesTheme">
    <v-app class="gradient-background">
      <v-app-bar>
        <template #prepend>
          <v-app-bar-nav-icon icon="mdi-arrow-left" />
        </template>
        <v-btn icon>
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </v-app-bar>
      <v-main>
        <slot />
      </v-main>
    </v-app>
  </v-theme-provider>
</template>
