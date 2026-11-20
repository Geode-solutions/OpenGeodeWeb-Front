<script setup lang="ts">
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const feedbackStore = useFeedbackStore();

function reload(): void {
  globalThis.location.reload();
}

defineExpose({ reload });
</script>

<template>
  <v-banner
    v-if="feedbackStore.server_error"
    elevation="2"
    bg-color="surface-variant"
    style="z-index: 4"
    position="fixed"
  >
    <v-row>
      <v-col cols="auto" class="text-center">
        <v-icon
          class="justify-right"
          v-tooltip:bottom="'We turn off our server automatically after 5 minutes of inactivity'"
        >
          ph-info
        </v-icon>
      </v-col>
      <v-col cols="auto" class="font-weight-bold">
        Server timed out due to inactivity, please reload this page or click here:
      </v-col>
      <v-col class="align-items" cols="auto">
        <v-btn color="accent" variant="flat" density="compact" @click="reload()"> Reload </v-btn>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          icon
          variant="text"
          size="20"
          class=".align-center"
          @click="feedbackStore.delete_server_error()"
        >
          <v-icon icon="ph-x" size="20" />
        </v-btn>
      </v-col>
    </v-row>
  </v-banner>
</template>
