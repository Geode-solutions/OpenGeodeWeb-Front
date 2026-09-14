<script setup lang="ts">
import AttributeRangeSelector from "@ogw_front/components/Viewer/Options/AttributeRangeSelector";
import ColorMapList from "@ogw_front/components/Viewer/Options/ColorMapList";

import { getPresetsWithCurrentAtTop } from "@ogw_front/utils/colormap";
import { useGlobalAttributeStyle } from "@ogw_front/composables/global_attribute_style";

interface Props {
  dataId?: string;
  x: number;
  y: number;
}

const { dataId = undefined, x, y } = defineProps<Props>();

const show = defineModel<boolean>("show", { default: false });

const dataIdRef = computed(() => dataId);
const { currentColormap, currentRange, applyGlobalColormap, resetGlobalRange } =
  useGlobalAttributeStyle(dataIdRef);

const minimum = computed({
  get: () => currentRange.value[0],
  set: (val) => {
    currentRange.value = [val, currentRange.value[1]];
  },
});

const maximum = computed({
  get: () => currentRange.value[1],
  set: (val) => {
    currentRange.value = [currentRange.value[0], val];
  },
});

const quickColormapPresets = computed(() =>
  getPresetsWithCurrentAtTop(currentColormap.value),
);

async function onQuickColormapSelect(preset: { Name: string }) {
  await applyGlobalColormap(preset.Name);
}
</script>

<template>
  <v-menu
    v-model="show"
    :target="[x, y - 80]"
    location="top center"
    :close-on-content-click="false"
    eager
  >
    <ColorMapList
      :presets="quickColormapPresets"
      :selected-preset-name="currentColormap"
      @select="onQuickColormapSelect"
    >
      <v-divider class="my-2"></v-divider>
      <AttributeRangeSelector
        v-model:minimum="minimum"
        v-model:maximum="maximum"
        @reset="resetGlobalRange"
      />
    </ColorMapList>
  </v-menu>
</template>
