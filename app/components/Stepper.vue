<script setup>
import Step from "@ogw_front/components/Step";

const emit = defineEmits(["reset_values", "close"]);
const stepper_tree = inject("stepper_tree");
const { steps, current_step_index } = toRefs(stepper_tree);
</script>

<template>
  <v-card-item class="flex-shrink-0 pa-0">
    <div class="px-3 pt-3 pb-1">
      <div class="d-flex align-center mb-1">
        <v-icon icon="mdi-file-upload-outline" class="mr-2 title-text" size="20" />
        <h2 class="text-subtitle-1 font-weight-bold title-text mb-0">Import Data</h2>
      </div>
      <p class="text-caption text-white opacity-70 mb-0">
        Select and configure files for a seamless import.
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
      :step_index="index"
      @reset_values="emit('reset_values')"
    />
  </v-stepper-vertical>
</template>

<style scoped>
.custom-stepper :deep(.v-stepper-vertical-item) {
  background: transparent !important;
}

.custom-stepper :deep(.v-stepper-vertical-item__content) {
  background: rgba(255, 255, 255, 0.03) !important;
  border-radius: 12px;
  margin: 2px 4px 4px 20px !important;
  padding: 4px !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.custom-stepper :deep(.v-avatar) {
  width: 24px !important;
  height: 24px !important;
  min-width: 24px !important;
  font-size: 0.75rem !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
}

.custom-stepper :deep(.v-stepper-vertical-item--active .v-avatar) {
  background: #3c9983 !important;
  border-color: #3c9983;
  color: #0a0f0e !important;
}

.custom-stepper :deep(.v-stepper-vertical-item__connector) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
