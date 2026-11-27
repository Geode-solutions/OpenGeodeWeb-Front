<script setup lang="ts">
import type { MenuItemIndex, Tooltip } from "@ogw_front/types/ui";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import PolygonalSurfacePolygons from "@ogw_front/assets/viewer_svgs/surface_triangles.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import ViewerSurfacePolygonsColoring from "@ogw_front/components/Viewer/Surface/PolygonsColoring.vue";
import type { Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  dataId: DataId;
  index: MenuItemIndex;
  tooltip?: Tooltip;
}

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const { dataId, index, tooltip = "Polygons options" } = defineProps<Props>();

const visibility = computed<Visibility>({
  get: () => dataStyleStore.meshPolygonsVisibility(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPolygonsVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshPolygonsMenu"
    :index="index"
    :tooltip="tooltip"
    :btnImage="PolygonalSurfacePolygons"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolygonsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <ViewerSurfacePolygonsColoring :data-id="dataId" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
