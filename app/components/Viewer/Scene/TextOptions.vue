<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { SceneFontFamily } from "@ogw_internal/stores/data_style/types";
import SceneText from "@ogw_front/assets/viewer_svgs/scene_text.svg";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const FONT_FAMILIES: { title: string; value: SceneFontFamily }[] = [
  { title: "Arial", value: "arial" },
  { title: "Courier", value: "courier" },
  { title: "Times", value: "times" },
];

const textColor = computed<RGBAColor>({
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
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Text"
    :btnImage="SceneText"
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
