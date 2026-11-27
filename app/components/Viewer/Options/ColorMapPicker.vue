<script setup lang="ts">
import type {
  AttributeRangeMaximum,
  AttributeRangeMinimum,
} from "@geode/opengeodeweb-viewer/schema_types";
import { drawCanvasForPreset, getPresetsWithCurrentAtTop } from "@ogw_front/utils/colormap";
import type { AttributeColorMap } from "@ogw_front/types/attribute";
import ColorMapList from "./ColorMapList.vue";
import type { ColorMapPreset } from "@ogw_front/types/props/viewer/options";
import GlassCard from "@ogw_front/components/GlassCard.vue";

interface Props {
  min: AttributeRangeMinimum;
  max: AttributeRangeMaximum;
}

const { max, min } = defineProps<Props>();

const selectedPresetName = defineModel<AttributeColorMap>("selectedPresetName", {
  default: "batlow",
});

const menuOpen = ref<boolean>(false);
const lutCanvas = ref<HTMLCanvasElement | undefined>(undefined);

const presets = computed(() => getPresetsWithCurrentAtTop(selectedPresetName.value));

function drawLutCanvas(): void {
  drawCanvasForPreset(selectedPresetName.value, lutCanvas.value);
}

function onSelectPreset(preset: ColorMapPreset): void {
  selectedPresetName.value = preset.Name;
  menuOpen.value = false;
}

onMounted(() => nextTick(drawLutCanvas));
watch(
  [
    lutCanvas,
    selectedPresetName,
    (): AttributeRangeMinimum => min,
    (): AttributeRangeMaximum => max,
  ],
  drawLutCanvas,
);
</script>

<template>
  <v-menu v-model="menuOpen" :close-on-content-click="false" location="bottom">
    <template #activator="{ props: menuProps }">
      <GlassCard
        data-testid="colorMapPicker"
        v-bind="menuProps"
        variant="ui"
        padding="pa-2"
        rounded="sm"
        class="d-flex flex-column"
        style="gap: 4px; cursor: pointer"
      >
        <span class="text-caption font-weight-medium">
          {{ selectedPresetName }}
        </span>
        <canvas ref="lutCanvas" width="200" height="18" class="w-100 rounded-xs border-thin" />
      </GlassCard>
    </template>

    <ColorMapList
      :presets="presets"
      :selected-preset-name="selectedPresetName"
      @select="onSelectPreset"
    />
  </v-menu>
</template>

<style scoped>
.border-thin {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}
</style>
