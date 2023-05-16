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
        <h1>Choose a name</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-form style="min-width: 300px">
          <v-row>
            <v-col>
              <v-text-field label="Guest name" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <button-primary>Continue</button-primary>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
    <v-btn variant="text">Login instead</v-btn>
    <v-spacer />
  </v-container>
</template>
