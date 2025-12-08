<template>
  <v-banner
    v-if="feedbackStore.server_error"
    elevation="2"
    style="background-color: grey; z-index: 9999"
    position="fixed"
  >
    <v-row>
      <v-col cols="auto" class="text-white text-center">
        <v-icon
          v-bind="props"
          color="white"
          class="justify-right"
          v-tooltip:bottom="
            'We turn off our server automatically after 5 minutes of inactivity'
          "
        >
          mdi-information-outline
        </v-icon>
      </v-col>
      <v-col cols="auto" class="text-white font-weight-bold">
        Server timed out due to inactivity, please reload this page or click
        here:
      </v-col>
      <v-col class="align-items" cols="auto">
        <v-btn color="grey" density="compact" @click="reload()"> Reload </v-btn>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          icon
          variant="flat"
          size="20"
          color="grey"
          class=".align-center"
          @click="feedbackStore.delete_server_error()"
        >
          <v-icon icon="mdi-close" size="20" color="white" />
        </v-btn>
      </v-col>
    </v-row>
  </v-banner>
</template>

<script setup>
  import { useFeedbackStore } from "@ogw_front/stores/feedback.js"
  const feedbackStore = useFeedbackStore()

  function reload() {
    window.location.reload()
  }
</script>
