<template>
  <v-stepper-vertical
    v-model="props.stepper_tree.current_step_index"
    class="pa-4 ma-0"
    elevation="1"
    rounded
  >
    <v-stepper-items>
      <v-col cols="12">
        <Step
          v-for="(step, index) in props.stepper_tree.steps"
          :key="step"
          :step_index="index"
          :step="step"
          :active_step_index="props.stepper_tree.current_step_index"
          @reset_values="emit('reset_values')"
        />
      </v-col>
    </v-stepper-items>
  </v-stepper-vertical>
</template>

<script setup>
  const emit = defineEmits(["reset_values"])

  const props = defineProps({
    stepper_tree: { type: Object, required: true },
  })
</script>
