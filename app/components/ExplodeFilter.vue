<script setup lang="ts">
import FactorFilterPanel from "@ogw_front/components/FactorFilterPanel.vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const DEFAULT_EXPLODE_VALUE = 0.2;
const MIN_EXPLODE_VALUE = 0;
const MAX_EXPLODE_VALUE = 1;

interface Props {
  escapeFunction?: () => void;
}

const { escapeFunction = undefined } = defineProps<Props>();

const show = defineModel<boolean>("show", { default: false });
const hybridViewerStore = useHybridViewerStore();
</script>

<template>
  <FactorFilterPanel
    v-model:show="show"
    title="Exploded View"
    label="Explode Factor"
    test-id-prefix="explode"
    :set-factor="hybridViewerStore.setExplode"
    :factor-range="{
      min: MIN_EXPLODE_VALUE,
      max: MAX_EXPLODE_VALUE,
      defaultValue: DEFAULT_EXPLODE_VALUE,
      neutralValue: MIN_EXPLODE_VALUE,
    }"
    :escapeFunction="escapeFunction"
  />
</template>
