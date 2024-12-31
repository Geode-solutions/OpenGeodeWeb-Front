<template>
  <v-stepper-vertical v-model="current_step_index" class="stepper-container">
    <v-stepper-items>
      <Step v-for="(step, index) in steps" :key="step" :step_index="index" />
    </v-stepper-items>
  </v-stepper-vertical>
</template>

<script setup>
  const stepper_tree = inject("stepper_tree")
  const { steps, current_step_index } = toRefs(stepper_tree)
</script>

<style scoped>
  .stepper-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }
</style>
