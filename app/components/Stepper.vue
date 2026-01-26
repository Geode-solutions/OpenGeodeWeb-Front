<template>
  <v-card-item class="flex-shrink-0 pa-0">
    <v-card-title
      class="text-h4 text-primary px-8 pt-6 pb-4 font-weight-bold d-flex align-center"
    >
      <v-icon icon="mdi-file-upload-outline" class="mr-3" />
      Import Data
    </v-card-title>

    <v-card-subtitle class="px-8 pb-4 text-medium">
      Choose a file to import.
    </v-card-subtitle>
  </v-card-item>

  <v-stepper-vertical
    :model-value="current_step_index + 1"
    @update:model-value="current_step_index = $event - 1"
    flat
    non-linear
    class="pa-0 ma-0 bg-white rounded-xl overflow-hidden"
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
