<template>
  <v-stepper-vertical
    v-model="current_step_index"
    class="pa-0 ma-0 custom-stepper"
    flat
    rounded="xl"
  >
    <Step
      v-for="(step, index) in steps"
      :key="step"
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
    background: transparent !important;
  }

  :deep(.v-stepper-vertical-item) {
    padding: 0 !important;
    margin-bottom: 16px !important;
    border-radius: 24px !important;
    overflow: hidden;
    background: white;
    border: 1px solid rgba(0, 0, 0, 0.05) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :deep(.v-stepper-vertical-item--active) {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
    border-color: rgba(var(--v-theme-primary), 0.2) !important;
  }
</style>
