<script setup lang="ts">
import type {
  AttributeRangeMaximum,
  AttributeRangeMinimum,
} from "@geode/opengeodeweb-viewer/schema_types";
import type { AttributeRange } from "@ogw_front/types/attribute";

// A bound of the range an attribute coloring covers, its minimum or its maximum

interface Emits {
  reset: [];
}

type AttributeRangeBound = NonNullable<AttributeRange[number]>;

const emit = defineEmits<Emits>();

const minimum = defineModel<AttributeRangeMinimum>("minimum");
const maximum = defineModel<AttributeRangeMaximum>("maximum");

const minimumText = ref<string>("");
const maximumText = ref<string>("");

function formatValue(value: AttributeRangeBound | undefined): string {
  if (value === undefined) {
    return "";
  }
  return String(value);
}

watch(minimum, (value) => (minimumText.value = formatValue(value)), {
  immediate: true,
});
watch(maximum, (value) => (maximumText.value = formatValue(value)), {
  immediate: true,
});

// Text inputs (not type="number") so scientific notation like 1.5e7 can be typed, committed on enter or blur.
function parseValue(text: string): AttributeRangeBound | undefined {
  const value = Number(text.trim());
  return text.trim() === "" || !Number.isFinite(value) ? undefined : value;
}

function commitMinimum(): void {
  const value = parseValue(minimumText.value);
  if (value === undefined) {
    minimumText.value = formatValue(minimum.value);
    return;
  }
  minimum.value = value;
}

function commitMaximum(): void {
  const value = parseValue(maximumText.value);
  if (value === undefined) {
    maximumText.value = formatValue(maximum.value);
    return;
  }
  maximum.value = value;
}
</script>

<template>
  <v-row dense align="center" no-gutters>
    <v-col cols="5" class="pe-1">
      <v-text-field
        data-testid="attributeMinInput"
        v-model="minimumText"
        @keydown.enter="commitMinimum"
        @blur="commitMinimum"
        label="Min"
        inputmode="decimal"
        density="compact"
        hide-details
        variant="outlined"
      />
    </v-col>
    <v-col cols="2" class="d-flex justify-center">
      <v-btn
        data-testid="resetRangeButton"
        aria-label="Reset range"
        icon="ph-arrows-horizontal"
        size="x-small"
        variant="text"
        @click="emit('reset')"
        v-tooltip="'Reset range'"
      />
    </v-col>
    <v-col cols="5" class="ps-1">
      <v-text-field
        data-testid="attributeMaxInput"
        v-model="maximumText"
        @keydown.enter="commitMaximum"
        @blur="commitMaximum"
        label="Max"
        inputmode="decimal"
        density="compact"
        hide-details
        variant="outlined"
      />
    </v-col>
  </v-row>
</template>
