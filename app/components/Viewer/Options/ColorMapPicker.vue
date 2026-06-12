<script setup>
import { drawCanvasForPreset, getPresetsWithCurrentAtTop } from "@ogw_front/utils/colormap";
import ColorMapList from "./ColorMapList.vue";
import GlassCard from "@ogw_front/components/GlassCard.vue";

const { max, min } = defineProps({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
});

const selectedPresetName = defineModel("selectedPresetName", { type: String, default: "batlow" });

const menuOpen = ref(false);
const lutCanvas = ref();

const presets = computed(() => getPresetsWithCurrentAtTop(selectedPresetName.value));

function drawLutCanvas() {
  drawCanvasForPreset(selectedPresetName.value, lutCanvas.value);
}

function onSelectPreset(preset) {
  selectedPresetName.value = preset.Name;
  menuOpen.value = false;
}

onMounted(() => nextTick(drawLutCanvas));
watch([lutCanvas, selectedPresetName, () => min, () => max], drawLutCanvas);
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
        <span class="text-caption text-white font-weight-medium">
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
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}
</style>
