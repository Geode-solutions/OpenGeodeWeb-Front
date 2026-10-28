<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import SceneCompass from "@ogw_front/assets/viewer_svgs/scene_compass.svg";
import type { SceneOrientationWidget } from "@ogw_internal/stores/data_style/types";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const orientationWidget = computed<SceneOrientationWidget>({
  get: () => dataStyleStore.sceneStyle.orientation_widget,
  set: async (marker) => {
    await dataStyleStore.setSceneOrientationWidget(marker);
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="sceneOrientationWidgetMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Orientation widget"
    :btnImage="SceneCompass"
  >
    <template #options>
      <v-btn-toggle
        v-model="orientationWidget"
        data-testid="sceneOrientationWidgetToggle"
        mandatory
        density="compact"
        divided
      >
        <v-btn value="axes" data-testid="sceneOrientationWidgetAxes">Axes</v-btn>
        <v-btn value="compass" data-testid="sceneOrientationWidgetCompass">Compass</v-btn>
      </v-btn-toggle>
    </template>
  </ViewerContextMenuItem>
</template>
