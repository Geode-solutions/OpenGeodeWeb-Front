<template>
  <v-stepper-vertical
    v-model="current_step_index"
    class="pa-4 ma-0"
    elevation="1"
    rounded
  >
    <v-stepper-items>
      <v-col cols="12">
        <Step v-for="(step, index) in steps" :key="step" :step_index="index" />
      </v-col>
    </v-stepper-items>
  </v-stepper-vertical>
</template>

<script setup>
  const stepper_tree = inject("stepper_tree")
  const { steps, current_step_index } = toRefs(stepper_tree)
</script>
