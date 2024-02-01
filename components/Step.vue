<template>
  <v-card class="pa-5">
    <v-row align="center" @click="set_current_step(step_index)">
      <v-col cols="auto">
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
      <v-col cols="auto">
        <p class="font-weight-bold">
          {{ steps[step_index].step_title }}
        </p>
      </v-col>
      <v-col
        v-if="
          steps[step_index].chips.length && current_step_index >= step_index
        "
      >
        <v-chip
          v-for="(chip, chip_index) in steps[step_index].chips"
          :key="chip_index"
        >
          {{ chip }}
        </v-chip>
      </v-col>
    </v-row>
    <Transition name="slide-fade">
      <v-col v-if="step_index == current_step_index">
        <component
          :is="steps[step_index].component.component_name"
          v-bind="steps[step_index].component.component_options"
          @update_values="update_values_event"
          @increment_step="increment_step()"
          @decrement_step="decrement_step()"
        />
      </v-col>
    </Transition>
  </v-card>
</template>

<script setup>
  const props = defineProps({
    step_index: { type: Number, required: true },
  })
  const { step_index } = props
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
  .slide-fade-enter-active {
    transition: all 0.5s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.5s ease-in;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(50px);
    opacity: 0;
  }
</style>
