<script setup lang="ts">
import type { DataId, MeshId } from "@ogw_front/types/identifiers";
import {
  type RangesPerData,
  applyRangesPerData,
  useBatchStyle,
} from "@ogw_front/composables/batch_style";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import { useBatchStyleModel } from "@ogw_front/composables/batch_style_model";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  dataId: DataId;
  capabilities: Record<string, { available?: boolean; hasColorMap?: boolean }>;
}

const { dataId, capabilities } = defineProps<Props>();

const coloring_style_key = computed<string>({
  get: () => dataStyleStore.meshEdgesActiveColoring(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesActiveColoring(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = useBatchStyleModel<RGBAColor>(
  () => dataId,
  (meshId) => dataStyleStore.meshEdgesColor(meshId) as RGBAColor | undefined,
  (meshId, value) => dataStyleStore.setMeshEdgesColor(meshId, value),
);
const opacity = useBatchStyleModel<number>(
  () => dataId,
  (meshId) => dataStyleStore.meshEdgesOpacity(meshId),
  (meshId, value) => dataStyleStore.setMeshEdgesOpacity(meshId, value),
);
const vertex_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshEdgesVertexAttributeName(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeName(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshEdgesVertexAttributeTimeStep(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeTimeStep(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshEdgesVertexAttributeItem(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeItem(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshEdgesVertexAttributeRange(dataId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeRange(meshId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshEdgesVertexAttributeColorMap(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeColorMap(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshEdgesVertexAttributeNoDataColor(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesVertexAttributeNoDataColor(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeName(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeName(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const edge_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeTimeStep(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeTimeStep(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeItem(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeItem(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeRange(dataId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeRange(meshId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeColorMap(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeColorMap(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeNoDataColor(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesEdgeAttributeNoDataColor(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

async function setVertexAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (meshId, minimum, maximum) =>
    dataStyleStore.setMeshEdgesVertexAttributeRange(meshId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}

async function setEdgeAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (meshId, minimum, maximum) =>
    dataStyleStore.setMeshEdgesEdgeAttributeRange(meshId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}
</script>

<template>
  <ViewerOptionsColoringTypeSelector
    :data-id="dataId"
    v-model:coloring_style_key="coloring_style_key"
    v-model:color="color"
    v-model:opacity="opacity"
    v-model:vertex_attribute_name="vertex_attribute_name"
    v-model:vertex_attribute_item="vertex_attribute_item"
    v-model:vertex_attribute_range="vertex_attribute_range"
    @vertex_attribute_ranges_per_data="setVertexAttributeRangesPerData"
    v-model:vertex_attribute_color_map="vertex_attribute_color_map"
    v-model:vertex_attribute_no_data_color="vertex_attribute_no_data_color"
    v-model:vertex_attribute_time_step="vertex_attribute_time_step"
    v-model:edge_attribute_name="edge_attribute_name"
    v-model:edge_attribute_item="edge_attribute_item"
    v-model:edge_attribute_range="edge_attribute_range"
    @edge_attribute_ranges_per_data="setEdgeAttributeRangesPerData"
    v-model:edge_attribute_color_map="edge_attribute_color_map"
    v-model:edge_attribute_no_data_color="edge_attribute_no_data_color"
    v-model:edge_attribute_time_step="edge_attribute_time_step"
    :capabilities="capabilities"
  />
</template>
