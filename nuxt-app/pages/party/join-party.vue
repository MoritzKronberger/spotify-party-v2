<script setup lang="ts">
  import SvgIcon from '@jamescoyle/vue-icon'
  import { mdiQrcodeScan } from '@mdi/js'
  import SpotButton from '~/components/spot-button.vue'

  const path = mdiQrcodeScan
</script>

<template>
  <v-container class="fill-height flex-column">
    <v-spacer />

    <v-row>
      <v-col>
        <h1>Join Party</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-row>
          <v-col align="center">
            <svg-icon type="mdi" :path="path" size="80" />
          </v-col>
        </v-row>
        <v-row>
          <v-col align="center">
            <spot-button :primary="true" title="scan qr code" />
          </v-col>
        </v-row>

        <v-row>
          <v-col align="center">
            <p class="text-center font-weight-bold">or</p>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-row>
              <v-col>
                <v-text-field label="Enter Code" />
              </v-col>
            </v-row>
            <spot-button :primary="true" title="join" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-spacer />
  </v-container>
</template>
