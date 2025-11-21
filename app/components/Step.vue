<template>
  <v-stepper-content :step="step_index + 1">
    <v-row
      align="center"
      class="mb-4 py-2"
      @click="set_current_step(step_index)"
    >
      <v-col cols="auto" class="d-flex justify-center align-center">
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
      <v-col>
        <p class="m-0 font-weight-bold">
          {{ steps[step_index].step_title }}
        </p>
      </v-col>
      <v-chip-group
        v-if="
          steps[step_index].chips.length && current_step_index >= step_index
        "
        column
        class="d-flex flex-wrap ma-2 overflow-y-auto"
        multiple
        style="max-height: 150px"
      >
        <v-chip
          v-for="(chip, chip_index) in steps[step_index].chips"
          :key="chip_index"
          class="ma-1"
          :title="chip"
        >
          {{ truncate(chip, 50) }}
        </v-chip>
      </v-chip-group>
    </v-row>
    <component
      v-if="step_index == current_step_index"
      :key="step_index"
      :is="steps[step_index].component.component_name"
      v-bind="steps[step_index].component.component_options"
      @update_values="update_values_event"
      @increment_step="increment_step"
      @decrement_step="decrement_step"
    />
  </v-stepper-content>
</template>

<script setup>
  function truncate(text, maxLength) {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "..."
    }
    return text
  }

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

  const sortedChips = computed(() => {
    const chips = steps.value[props.step_index]?.chips || []
    return [...chips].sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    )
  })
</script>
