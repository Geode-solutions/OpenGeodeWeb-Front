<script setup lang="ts">
import AttributeRangeSelector from "@ogw_front/components/Viewer/Options/AttributeRangeSelector.vue";
import ColorMapList from "@ogw_front/components/Viewer/Options/ColorMapList.vue";
import TimeStepSlider from "@ogw_front/components/Viewer/Options/TimeStepSlider.vue";

import { getPresetsWithCurrentAtTop } from "@ogw_front/utils/colormap";
import { useGlobalAttributeStyle } from "@ogw_front/composables/global_attribute_style";
import { useModelAttributeStyle } from "@ogw_front/composables/model_attribute_style";

interface Props {
  dataId?: string;
  blockIds?: number[];
  x: number;
  y: number;
}

const { dataId = undefined, blockIds = undefined, x, y } = defineProps<Props>();

const show = defineModel<boolean>("show", { default: false });

const dataIdRef = computed<string>(() => dataId);
// The parent keys this picker on the picked data: a mesh or a model, so the style is chosen once here
const {
  currentColormap,
  currentRange,
  applyGlobalColormap,
  resetGlobalRange,
  currentTimeSteps,
  currentTimeStep,
  loadTimeSteps,
} =
  blockIds === undefined
    ? useGlobalAttributeStyle(dataIdRef)
    : useModelAttributeStyle(
        dataIdRef,
        computed<number[]>(() => blockIds),
      );

watch(show, async (isShown) => {
  if (isShown) {
    await loadTimeSteps();
  }
});

const minimum = computed<number>({
  get: () => currentRange.value[0],
  set: (val) => {
    currentRange.value = [val, currentRange.value[1]];
  },
});

const maximum = computed<number>({
  get: () => currentRange.value[1],
  set: (val) => {
    currentRange.value = [currentRange.value[0], val];
  },
});

const quickColormapPresets = computed<{ Name: string }[]>(() =>
  getPresetsWithCurrentAtTop(currentColormap.value),
);

async function onQuickColormapSelect(preset: { Name: string }): Promise<void> {
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
      <TimeStepSlider :time-steps="currentTimeSteps" v-model="currentTimeStep" />
    </ColorMapList>
  </v-menu>
</template>
