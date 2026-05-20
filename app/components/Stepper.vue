<script setup>
import Step from "@ogw_front/components/Step";

const emit = defineEmits(["reset_values", "close"]);
const stepper_tree = inject("stepper_tree");
const { steps, current_step_index } = toRefs(stepper_tree);
</script>

<template>
  <v-card-item class="pb-1 pt-3 align-center flex-shrink-0">
    <template v-slot:prepend>
      <v-avatar size="32" rounded="0" class="me-2" color="transparent">
        <v-icon icon="mdi-file-upload-outline" color="primary" size="24" />
      </v-avatar>
    </template>

    <v-card-title class="text-subtitle-1 text-primary font-weight-bold" style="line-height: 1.2;">
      Import Data
    </v-card-title>
    <v-card-subtitle class="ma-0 mt-0.5 opacity-70 flex-shrink-0 text-caption text-wrap" style="font-size: 0.72rem !important; line-height: 1.2;">
      Select and configure files for a seamless import.
    </v-card-subtitle>
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
  padding: 8px 10px !important;
}

.custom-stepper :deep(.v-stepper-vertical-item__content) {
  background: rgba(255, 255, 255, 0.03) !important;
  border-radius: 12px;
  margin: 4px 0px 4px 18px !important;
  padding: 8px !important;
  border: 1px solid rgba(255, 255, 255, 0.06);
  flex: none !important;
}

.custom-stepper :deep(.v-avatar) {
  width: 20px !important;
  height: 20px !important;
  min-width: 20px !important;
  font-size: 0.65rem !important;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08) !important;
  color: white !important;
}

.custom-stepper :deep(.v-stepper-vertical-item--active .v-avatar) {
  background: var(--v-primary-base, #4db6ac) !important;
  border-color: var(--v-primary-base, #4db6ac) !important;
  color: #0a0f0e !important;
  box-shadow: 0 0 8px rgba(77, 182, 172, 0.4);
}

.custom-stepper :deep(.v-stepper-vertical-item__connector) {
  border-color: rgba(255, 255, 255, 0.12) !important;
  border-width: 1.5px !important;
}

.custom-stepper :deep(.v-stepper-vertical-item__title) {
  font-size: 0.72rem !important;
}
</style>
