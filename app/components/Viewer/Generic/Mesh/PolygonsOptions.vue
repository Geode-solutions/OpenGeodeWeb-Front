<script setup lang="ts">
import type { ImageSource, MenuItemIndex, Tooltip } from "@ogw_front/types/ui";
import type { ColoringCapabilities } from "@ogw_front/types/props/viewer/options";
import type { MeshId } from "@ogw_front/types/identifiers";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshPolygonsColoring from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsColoring.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import type { Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  dataId: MeshId;
  index: MenuItemIndex;
  btnImage: ImageSource;
  tooltip?: Tooltip;
  capabilities?: ColoringCapabilities;
}

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const {
  dataId,
  index,
  btnImage,
  tooltip = "Polygons options",
  capabilities = {},
} = defineProps<Props>();

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
    :btnImage="btnImage"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolygonsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-divider />
        <ViewerGenericMeshPolygonsColoring :data-id="dataId" :capabilities="capabilities" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
