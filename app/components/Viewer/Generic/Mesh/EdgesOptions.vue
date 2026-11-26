<script setup lang="ts">
import type { EdgeWidth, Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshEdgesColoring from "@ogw_front/components/Viewer/Generic/Mesh/EdgesColoring.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import ViewerOptionsWidthSlider from "@ogw_front/components/Viewer/Options/Sliders/Width.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface CapabilityConfig {
  available?: boolean;
  hasColorMap?: boolean;
}

interface Props {
  dataId: DataId;
  index: number;
  btnImage: string;
  tooltip?: string;
  capabilities?: Record<string, CapabilityConfig>;
}

const {
  dataId,
  index,
  btnImage,
  tooltip = "Edges options",
  capabilities = {},
} = defineProps<Props>();

const visibility = computed<Visibility>({
  get: () => dataStyleStore.meshEdgesVisibility(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const width = computed<EdgeWidth>({
  get: () => dataStyleStore.meshEdgesWidth(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesWidth(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshEdgesMenu"
    :index="index"
    :tooltip="tooltip"
    :btnImage="btnImage"
  >
    <template #options>
      <v-row>
        <v-col>
          <ViewerOptionsVisibilitySwitch
            data-testid="meshEdgesVisibilitySwitch"
            v-model="visibility"
          />
        </v-col>
      </v-row>
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsWidthSlider data-testid="meshEdgesWidthSlider" v-model="width" />
        <ViewerGenericMeshEdgesColoring :data-id="dataId" :capabilities="capabilities" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
