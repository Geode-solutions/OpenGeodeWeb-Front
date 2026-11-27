<script setup lang="ts">
import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { SceneFontFamily } from "@ogw_internal/stores/data_style/types";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  index: number;
}

const { index } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const FONT_FAMILIES: { title: string; value: SceneFontFamily }[] = [
  { title: "Arial", value: "arial" },
  { title: "Courier", value: "courier" },
  { title: "Times", value: "times" },
];

const textColor = computed<ColorRGBA>({
  get: () => dataStyleStore.sceneStyle.text.color,
  set: async (color) => {
    await dataStyleStore.setSceneTextColor(color);
    hybridViewerStore.remoteRender();
  },
});

const fontFamily = computed<SceneFontFamily>({
  get: () => dataStyleStore.sceneStyle.text.font_family,
  set: async (font_family) => {
    await dataStyleStore.setSceneFontFamily(font_family);
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="sceneTextMenu"
    :index="index"
    tooltip="Text"
    btnIcon="ph-text-aa"
  >
    <template #options>
      <v-select
        v-model="fontFamily"
        data-testid="sceneFontFamilySelect"
        :items="FONT_FAMILIES"
        label="Font"
        density="compact"
        hide-details
      />
      <ViewerOptionsColorPicker v-model="textColor" class="mt-2" />
    </template>
  </ViewerContextMenuItem>
</template>
