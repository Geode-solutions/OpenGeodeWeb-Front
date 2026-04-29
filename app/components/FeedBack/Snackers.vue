<script setup>
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const MARGIN_BETWEEN_SNACKERS = 60;
const FIRST_SNACKER_MARGIN = 8;

const feedbackStore = useFeedbackStore();
const show = ref(true);

function calc_margin(index) {
  return `${index * MARGIN_BETWEEN_SNACKERS + FIRST_SNACKER_MARGIN}px`;
}
</script>

<template>
  <v-snackbar
    v-for="(feedback, index) in feedbackStore.feedbacks"
    :key="feedback"
    v-model="show"
    :style="{ 'margin-bottom': calc_margin(index) }"
    :color="feedback.type"
    location="bottom right"
    transition="slide-x-reverse-transition"
    max-width="400px"
    timeout="10000"
  >
    <v-row dense class="flex-nowrap">
      <v-col cols="auto">
        <v-tooltip
          v-if="feedback.type === 'error' && (feedback.code || feedback.route)"
          location="left"
        >
          <span>
            error: {{ feedback.code }} {{ feedback.name }}<br />
            ressource: {{ feedback.route }}
            <br />
          </span>
          <template #activator="{ props }">
            <v-icon v-bind="props" color="white" class="justify-right">
              mdi-information-outline
            </v-icon>
          </template>
        </v-tooltip>
        <v-icon v-else-if="feedback.type === 'error'" color="white" class="justify-right">
          mdi-alert-circle-outline
        </v-icon>
        <v-icon v-else-if="feedback.type === 'success'" color="white" class="justify-right">
          mdi-check-circle-outline
        </v-icon>
      </v-col>
      <v-col cols="9" class="overflow-hidden">
        <v-tooltip location="top">
          <span>
            {{ feedback.description }}
            <br />
          </span>
          <template #activator="{ props }">
            <div v-bind="props">
              {{ feedback.description }}
            </div>
          </template>
        </v-tooltip>
      </v-col>
      <v-spacer />
      <v-col cols="auto">
        <v-btn
          icon
          variant="flat"
          size="20"
          :color="feedback.type"
          @click="feedbackStore.delete_feedback(feedback.id)"
        >
          <v-icon icon="mdi-close" size="20" color="white" />
        </v-btn>
      </v-col>
    </v-row>
  </v-snackbar>
</template>

<style scoped>
.v-snackbar :deep(.v-snackbar__content) {
  width: 100%;
}
</style>
