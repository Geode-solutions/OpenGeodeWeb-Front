<script setup lang="ts">
import type { PropType, Ref } from "vue";
import type { useStepperTree } from "@ogw_front/composables/stepper_tree";

interface StepConfig {
  step_title: string;
  chips?: string[];
  component: { component_name: string; component_options?: Record<string, unknown> };
}

function truncate(text: string, maxLength: number) {
  if (text.length > maxLength) {
    return `${text.slice(0, maxLength)}...`;
  }
  return text;
}

// oxlint-disable-next-line vue/define-props-declaration
const { stepIndex, stepperTree } = defineProps({
  stepIndex: { type: Number, required: true },
  stepperTree: { type: Object as PropType<ReturnType<typeof useStepperTree>>, required: true },
});

// oxlint-disable-next-line vue/define-emits-declaration
const emit = defineEmits(["reset_values"]);

const { state, increment_step, decrement_step, update_values } = stepperTree;
const { current_step_index, steps } = toRefs(state) as unknown as {
  current_step_index: Ref<number>;
  steps: Ref<StepConfig[]>;
};

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
