<script setup lang="ts">
import type { MenuItemIndex, Tooltip } from "@ogw_front/types/ui";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import SolidPolyhedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import ViewerSolidSpecificPolyhedraColoring from "@ogw_front/components/Viewer/Solid/SpecificPolyhedraColoring.vue";
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

const { dataId, index, tooltip = "Polyhedra options" } = defineProps<Props>();

const visibility = computed<Visibility>({
  get: () => dataStyleStore.meshPolyhedraVisibility(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPolyhedraVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshPolyhedraMenu"
    :index="index"
    :tooltip="tooltip"
    :btnImage="SolidPolyhedra"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolyhedraVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <ViewerSolidSpecificPolyhedraColoring :data-id="dataId" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
