<script setup lang="ts">
  definePageMeta({
    layout: 'wireframes',
    middleware: ['auth'],
  })
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h1>Create Party</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-form style="min-width: 300px">
          <v-row>
            <v-col>
              <v-text-field label="Song name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <button-primary>Add song</button-primary>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
