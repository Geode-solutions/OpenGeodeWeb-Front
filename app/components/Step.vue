<script setup lang="ts">
import type { Count, DisplayText, StepIndex, Title } from "@ogw_front/types/ui";
import type { StepperTree } from "@ogw_front/types/props/components_files";

// A step of a stepper: its title, its chips and the component it displays
interface StepConfig {
  step_title: Title;
  chips?: string[];
  component: {
    component_name: string;
    component_options?: Record<string, unknown>;
  };
}

interface Props {
  stepIndex: StepIndex;
  stepperTree: StepperTree;
}

interface Emits {
  reset_values: [];
}

function truncate(text: DisplayText, maxLength: Count): DisplayText {
  if (text.length > maxLength) {
    return `${text.slice(0, maxLength)}...`;
  }
  return text;
}

const { stepIndex, stepperTree } = defineProps<Props>();

const emit = defineEmits<Emits>();

const { state, increment_step, decrement_step, update_values } = stepperTree;
const { current_step_index, steps } = toRefs(state) as unknown as {
  current_step_index: Ref<StepIndex>;
  steps: Ref<StepConfig[]>;
};

const sortedChips = computed<string[]>(() => {
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
          :class="current_step_index === stepIndex ? 'text-primary' : 'text-medium-emphasis'"
        >
          {{ steps[stepIndex]!.step_title }}
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
        :is="steps[stepIndex]!.component.component_name"
        v-bind="steps[stepIndex]!.component.component_options"
        @increment_step="increment_step"
        @decrement_step="decrement_step"
        @update_values="update_values"
        @reset_values="emit('reset_values')"
      />
    </v-card-text>
  </v-stepper-vertical-item>
</template>
