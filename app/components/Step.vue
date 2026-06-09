<script setup>
function truncate(text, maxLength) {
  if (text.length > maxLength) {
    return `${text.slice(0, maxLength)}...`;
  }
  return text;
}

const { stepIndex, stepperTree } = defineProps({
  stepIndex: { type: Number, required: true },
  stepperTree: { type: Object, required: true },
});

const emit = defineEmits(["reset_values"]);

const { state, increment_step, decrement_step, update_values } = stepperTree;
const { current_step_index, steps } = toRefs(state);

const sortedChips = computed(() => {
  const chips = steps.value[stepIndex]?.chips || [];
  return chips.toSorted((chipA, chipB) =>
    chipA.localeCompare(chipB, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
});
</script>

<template>
  <v-stepper-vertical-item
    :value="stepIndex + 1"
    :editable="stepIndex < current_step_index"
    color="primary"
    hide-actions
  >
    <template #title>
      <v-sheet color="transparent" class="d-flex flex-column justify-center ps-2">
        <p
          tag="h3"
          class="text-subtitle-1 font-weight-bold mb-0 transition-swing"
          :class="current_step_index === stepIndex ? 'text-primary' : 'text-grey-darken-1'"
        >
          {{ steps[stepIndex].step_title }}
        </p>

        <v-sheet
          v-if="sortedChips.length && current_step_index >= stepIndex"
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
        v-if="stepIndex === current_step_index"
        :key="stepIndex"
        :is="steps[stepIndex].component.component_name"
        v-bind="steps[stepIndex].component.component_options"
        @increment_step="increment_step"
        @decrement_step="decrement_step"
        @update_values="update_values"
        @reset_values="emit('reset_values')"
      />
    </v-card-text>
  </v-stepper-vertical-item>
</template>
