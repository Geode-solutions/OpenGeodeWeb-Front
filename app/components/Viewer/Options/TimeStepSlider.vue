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
  return time === undefined ? "" : `timestep = ${time}`;
}
</script>

<template>
  <div v-if="timeSteps.length > 1" class="mt-3">
    <div data-testid="timeStepValue" class="time-step-value">
      {{ formatTime(sliderTimeStep) }}
    </div>
    <v-slider
      data-testid="timeStepSlider"
      v-model="sliderTimeStep"
      :min="0"
      :max="timeSteps.length - 1"
      :step="1"
      color="primary"
      density="compact"
      class="time-step-slider"
      hide-details
      show-ticks="always"
      :tick-size="10"
      thumb-label="hover"
      @end="commitTimeStep"
      @keyup="commitTimeStep(sliderTimeStep)"
    >
      <template #thumb-label="{ modelValue }">{{ formatTime(modelValue) }}</template>
      <template #tick-label="{ index }">
        <span class="time-step-tick">
          <span class="v-slider-thumb__label time-step-tick-label">
            <span class="v-slider-thumb__label-wedge" />
            {{ formatTime(index) }}
          </span>
        </span>
      </template>
    </v-slider>
  </div>
</template>

<style scoped>
.time-step-value {
  white-space: nowrap;
  font-size: 0.8125rem;
}

.time-step-slider :deep(.v-slider-thumb__label) {
  width: auto;
  white-space: nowrap;
  padding: 0 6px;
}

/* Since v-tooltip is a bit different from the slider tick label */
.time-step-slider :deep(.v-slider-track__tick-label) {
  inset: 0;
  transform: none !important;
  margin: 0 !important;
}

.time-step-tick {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
}

.time-step-slider .time-step-tick-label {
  display: none;
  bottom: calc(100% + 8px) !important;
  left: 50%;
  pointer-events: none;
}

.time-step-tick:hover .time-step-tick-label {
  display: flex;
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
