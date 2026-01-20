<template>
  <v-stepper-vertical
    :model-value="current_step_index + 1"
    @update:model-value="current_step_index = $event - 1"
    class="pa-0 ma-0 custom-stepper"
    flat
    non-linear
  >
    <Step
      v-for="(step, index) in steps"
      :key="index"
      :step_index="index"
      @reset_values="emit('reset_values')"
    />
  </v-stepper-vertical>
</template>

<script setup>
  import Step from "@ogw_front/components/Step"

  const emit = defineEmits(["reset_values"])
  const stepper_tree = inject("stepper_tree")
  const { steps, current_step_index } = toRefs(stepper_tree)
</script>

<style scoped>
  .custom-stepper {
    background: white !important;
    border-radius: 24px !important;
    overflow: hidden;
  }

  :deep(.v-stepper-vertical-item) {
    padding: 0 !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :deep(.v-stepper-vertical-item--active) {
    background: rgba(var(--v-theme-primary), 0.02);
  }

  :deep(.v-stepper-vertical-item__loader) {
    display: none;
  }

  .gap-4 {
    gap: 16px;
  }
</style>
