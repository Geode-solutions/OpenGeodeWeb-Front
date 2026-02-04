<script setup>
  function truncate(text, maxLength) {
    if (text.length > maxLength) {
      return `${text.slice(0, maxLength)}...`
    }
    return text
  }

  const { step_index } = defineProps({
    step_index: { type: Number, required: true },
  })

  const stepper_tree = inject("stepper_tree")
  const { current_step_index, steps } = toRefs(stepper_tree)

  watch(current_step_index, (newVal, oldVal) => {
    if (newVal < oldVal) {
      stepper_tree.navigating_back = true
    }
  })

  function update_values_event(keys_values_object) {
    for (const [key, value] of Object.entries(keys_values_object)) {
      stepper_tree[key] = value
    }
  }

  function increment_step() {
    stepper_tree.current_step_index += 1
  }

  function decrement_step() {
    stepper_tree.current_step_index -= 1
  }

  const sortedChips = computed(() => {
    const chips = steps.value[step_index]?.chips || []
    return chips.toSorted((chipA, chipB) =>
      chipA.localeCompare(chipB, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    )
  })
</script>

<template>
  <v-stepper-vertical-item
    :value="step_index + 1"
    :editable="step_index < current_step_index"
    color="primary"
    hide-actions
  >
    <template #title>
      <v-sheet
        color="transparent"
        class="d-flex flex-column justify-center ps-2"
      >
        <v-text
          tag="h3"
          class="text-subtitle-1 font-weight-bold mb-0 transition-swing"
          :class="
            current_step_index === step_index
              ? 'text-primary'
              : 'text-grey-darken-1'
          "
        >
          {{ steps[step_index].step_title }}
        </v-text>

        <v-sheet
          v-if="sortedChips.length && current_step_index >= step_index"
          color="transparent"
          class="d-flex flex-wrap mt-2"
        >
          <v-chip
            v-for="(chip, chip_index) in sortedChips"
            :key="chip_index"
            size="small"
            class="me-2 mb-1 font-weight-medium"
            color="primary"
            variant="tonal"
          >
            {{ truncate(chip, 30) }}
          </v-chip>
        </v-sheet>
      </v-sheet>
    </template>

    <v-card-text class="pt-0">
      <v-divider class="mb-6 opacity-10" />

      <component
        v-if="step_index === current_step_index"
        :key="step_index"
        :is="steps[step_index].component.component_name"
        v-bind="steps[step_index].component.component_options"
        @increment_step="increment_step"
        @decrement_step="decrement_step"
        @update_values="update_values_event"
        @reset_values="$emit('reset_values')"
      />
    </v-card-text>
  </v-stepper-vertical-item>
</template>
