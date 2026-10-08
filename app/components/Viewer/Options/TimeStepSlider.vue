<script setup lang="ts">
const timeStep = defineModel<number>();

interface Props {
  timeSteps: number[];
}

const { timeSteps } = defineProps<Props>();

const sliderTimeStep = ref<number>(0);

watch(
  timeStep,
  (value) => {
    sliderTimeStep.value = value ?? 0;
  },
  { immediate: true },
);

function commitTimeStep(value: number): void {
  timeStep.value = value;
}

function formatTime(index: number): string {
  const time = timeSteps[index];
  return time === undefined ? "" : `t = ${time}`;
}
</script>

<template>
  <v-slider
    v-if="timeSteps.length > 1"
    data-testid="timeStepSlider"
    v-model="sliderTimeStep"
    :min="0"
    :max="timeSteps.length - 1"
    :step="1"
    color="primary"
    density="compact"
    class="time-step-slider mt-3"
    hide-details
    show-ticks="always"
    :tick-size="10"
    thumb-label="hover"
    @end="commitTimeStep"
    @keyup="commitTimeStep(sliderTimeStep)"
  >
    <template #prepend>
      <span data-testid="timeStepValue" class="time-step-value">
        {{ formatTime(sliderTimeStep) }}
      </span>
    </template>
    <template #thumb-label="{ modelValue }">{{ formatTime(modelValue) }}</template>
  </v-slider>
</template>

<style scoped>
.time-step-value {
  min-width: 32px;
  white-space: nowrap;
  font-size: 0.8125rem;
}

.time-step-slider.v-slider.v-input--horizontal :deep(.v-input__prepend) {
  margin-inline-end: 4px;
}

.time-step-slider :deep(.v-slider-thumb__label) {
  width: auto;
  white-space: nowrap;
  padding: 0 6px;
}

.time-step-slider :deep(.v-slider-track__tick) {
  border-radius: 50%;
  background-color: rgb(var(--v-theme-primary));
}

/* Vuetify insets the first and last ticks, which only suits tiny ticks */
.time-step-slider.v-slider.v-input--horizontal :deep(.v-slider-track__tick--first) {
  margin-inline-start: 0;
}

.time-step-slider.v-slider.v-input--horizontal :deep(.v-slider-track__tick--last) {
  margin-inline-start: 100%;
}
</style>
