<template>
  <v-stepper-content :step="step_index + 1">
    <v-row
      align="center"
      class="step-container"
      @click="set_current_step(step_index)"
    >
      <v-col cols="auto" class="icon-container">
        <v-icon
          v-if="current_step_index > step_index"
          icon="mdi-check-circle"
          color="grey"
        />
        <v-icon
          v-else-if="current_step_index == step_index"
          :icon="`mdi-numeric-${step_index + 1}-circle`"
          color="primary"
        />
        <v-icon
          v-else
          :icon="`mdi-numeric-${step_index + 1}-circle`"
          color="grey"
        />
      </v-col>
      <v-col class="title-container">
        <p class="step-title font-weight-bold">
          {{ steps[step_index].step_title }}
        </p>
      </v-col>
      <v-col
        v-if="
          steps[step_index].chips.length && current_step_index >= step_index
        "
        class="chips-container"
      >
        <v-chip
          v-for="(chip, chip_index) in steps[step_index].chips"
          :key="chip_index"
          class="step-chip"
        >
          {{ chip }}
        </v-chip>
      </v-col>
    </v-row>
    <Transition name="slide-fade" mode="out-in">
      <component
        v-if="step_index == current_step_index"
        :key="step_index"
        :is="steps[step_index].component.component_name"
        v-bind="steps[step_index].component.component_options"
        @update_values="update_values_event"
        @increment_step="increment_step"
        @decrement_step="decrement_step"
      />
    </Transition>
  </v-stepper-content>
</template>

<script setup>
  const props = defineProps({
    step_index: { type: Number, required: true },
  })

  const stepper_tree = inject("stepper_tree")
  const { current_step_index, steps } = toRefs(stepper_tree)

  function set_current_step(step_index) {
    stepper_tree.current_step_index = step_index
  }

  function update_values_event(keys_values_object) {
    for (const [key, value] of Object.entries(keys_values_object)) {
      stepper_tree[key] = value
    }
  }

  function increment_step() {
    stepper_tree.current_step_index++
  }

  function decrement_step() {
    stepper_tree.current_step_index--
  }
</script>

<style scoped>
  .step-container {
    margin-bottom: 16px;
    padding: 8px;
  }

  .icon-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .title-container {
    margin-left: 8px;
  }

  .step-title {
    margin: 0;
  }

  .chips-container {
    display: flex;
    gap: 4px;
  }

  .step-chip {
    background-color: #f5f5f5;
  }
</style>
