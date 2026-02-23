<script setup>
  import Step from "@ogw_front/components/Step"

  const emit = defineEmits(["reset_values", "close"])
  const stepper_tree = inject("stepper_tree")
  const { steps, current_step_index } = toRefs(stepper_tree)
</script>

<template>
  <div class="stepper-root fill-height d-flex flex-column">
    <v-card-item class="flex-shrink-0 pa-0">
      <div class="px-8 pt-8 pb-4">
        <div class="d-flex align-center mb-2">
          <v-icon
            icon="mdi-file-upload-outline"
            class="mr-3 title-text"
            size="32"
          />
          <h2 class="title-text">Import Data</h2>
        </div>
        <p class="text-white text-body-1">
          Select and configure your files for a seamless import.
        </p>
      </div>
    </v-card-item>

    <v-stepper-vertical
      :model-value="current_step_index + 1"
      @update:model-value="current_step_index = $event - 1"
      flat
      non-linear
      class="pa-0 ma-0 bg-transparent rounded-xl overflow-hidden custom-stepper flex-grow-1"
    >
      <Step
        v-for="(step, index) in steps"
        :key="index"
        :step_index="index"
        @reset_values="emit('reset_values')"
      />
    </v-stepper-vertical>
  </div>
</template>

<style scoped>
  .custom-stepper :deep(.v-stepper-vertical-item) {
    background: transparent !important;
  }

  .custom-stepper :deep(.v-stepper-vertical-item__content) {
    background: rgba(255, 255, 255, 0.03) !important;
    border-radius: 12px;
    margin: 8px 16px 16px 40px !important;
    padding: 16px !important;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .custom-stepper :deep(.v-avatar) {
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
