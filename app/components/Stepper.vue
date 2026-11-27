<script setup lang="ts">
import Step from "@ogw_front/components/Step.vue";
import type { StepIndex } from "@ogw_front/types/ui";
import type { StepperTree } from "@ogw_front/types/props/components_files";

interface Props {
  stepperTree: StepperTree;
}

interface Emits {
  reset_values: [];
  close: [];
}

const emit = defineEmits<Emits>();

const { stepperTree } = defineProps<Props>();
const { state } = stepperTree;
const { steps, current_step_index } = toRefs(state) as unknown as {
  steps: Ref<unknown[]>;
  current_step_index: Ref<StepIndex>;
};
</script>

<template>
  <v-card-item class="flex-shrink-0 pa-0">
    <div class="px-8 pt-8 pb-4">
      <div class="d-flex align-center mb-2">
        <v-icon icon="ph-file-arrow-up" class="mr-3 title-text" size="32" />
        <h2 class="title-text">Import Data</h2>
      </div>
      <p class="text-medium-emphasis text-body-1">
        Select and configure your files for a seamless import.
      </p>
    </div>
  </v-card-item>

  <v-stepper-vertical
    :model-value="current_step_index + 1"
    @update:model-value="current_step_index = $event - 1"
    flat
    non-linear
    class="pa-0 ma-0 bg-transparent rounded-xl overflow-y-auto custom-stepper flex-grow-1"
  >
    <Step
      v-for="(step, index) in steps"
      :key="index"
      :stepIndex="index"
      :stepperTree="stepperTree"
      @reset_values="emit('reset_values')"
    />
  </v-stepper-vertical>
</template>

<style scoped>
.custom-stepper :deep(.v-stepper-vertical-item) {
  background: transparent !important;
}

.custom-stepper :deep(.v-stepper-vertical-item__content) {
  background: rgba(var(--v-theme-on-surface), 0.04) !important;
  border-radius: 12px;
  margin: 8px 16px 16px 40px !important;
  padding: 16px !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.custom-stepper :deep(.v-avatar) {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-on-surface), 0.08) !important;
  color: rgb(var(--v-theme-on-surface)) !important;
}

.custom-stepper :deep(.v-stepper-vertical-item--active .v-avatar) {
  background: rgb(var(--v-theme-primary)) !important;
  border-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary)) !important;
}

.custom-stepper :deep(.v-stepper-vertical-item__connector) {
  border-color: rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
</style>
