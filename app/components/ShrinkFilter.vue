<script setup lang="ts">
import FactorFilterPanel from "@ogw_front/components/FactorFilterPanel.vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const DEFAULT_SHRINK_VALUE = 0.8;
const MIN_SHRINK_VALUE = 0;
const MAX_SHRINK_VALUE = 1;
const PERCENT = 100;

interface Props {
  escapeFunction?: () => void;
}

const { escapeFunction = undefined } = defineProps<Props>();

const show = defineModel<boolean>("show", { default: false });
const hybridViewerStore = useHybridViewerStore();

function formatShrinkFactor(value: number): string {
  return `${(value * PERCENT).toFixed(0)}% (${value.toFixed(2)})`;
}
</script>

<template>
  <FactorFilterPanel
    v-model:show="show"
    title="Shrink Filter"
    label="Shrink Factor"
    test-id-prefix="shrink"
    :set-factor="hybridViewerStore.setShrink"
    :factor-range="{
      min: MIN_SHRINK_VALUE,
      max: MAX_SHRINK_VALUE,
      defaultValue: DEFAULT_SHRINK_VALUE,
      neutralValue: MAX_SHRINK_VALUE,
    }"
    :format-value="formatShrinkFactor"
    :escapeFunction="escapeFunction"
  />
</template>
