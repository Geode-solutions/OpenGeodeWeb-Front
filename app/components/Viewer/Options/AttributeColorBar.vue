<script setup lang="ts">
import type {
  AttributeRangeMaximum,
  AttributeRangeMinimum,
} from "@geode/opengeodeweb-viewer/schema_types";
import type { AttributeColorMap } from "@ogw_front/types/attribute";
import AttributeRangeSelector from "./AttributeRangeSelector.vue";
import ColorMapPicker from "./ColorMapPicker.vue";

interface Emits {
  reset: [];
}

interface Props {
  hideRange: boolean;
}

const emit = defineEmits<Emits>();

const { hideRange } = defineProps<Props>();

const minimum = defineModel<AttributeRangeMinimum>("minimum");
const maximum = defineModel<AttributeRangeMaximum>("maximum");
const colorMap = defineModel<AttributeColorMap>("colorMap");
</script>

<template>
  <div class="attribute-colorbar mt-3">
    <ColorMapPicker
      v-model:selected-preset-name="colorMap"
      :min="minimum ?? 0"
      :max="maximum ?? 0"
    />
    <AttributeRangeSelector
      v-if="!hideRange"
      v-model:minimum="minimum"
      v-model:maximum="maximum"
      class="mt-2"
      @reset="emit('reset')"
    />
  </div>
</template>

<style scoped>
.attribute-colorbar {
  width: 100%;
}
</style>
