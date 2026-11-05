<script setup lang="ts">
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
  id: string;
}

const { id } = defineProps<Props>();

const coloring_style_key = computed<string>({
  get: () => dataStyleStore.meshEdgesActiveColoring(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshEdgesActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = useBatchStyleModel<RGBAColor>(
  () => id,
  (targetId) => dataStyleStore.meshEdgesColor(targetId) as RGBAColor | undefined,
  (targetId, value) => dataStyleStore.setMeshEdgesColor(targetId, value),
);
const opacity = useBatchStyleModel<number>(
  () => id,
  (targetId) => dataStyleStore.meshEdgesOpacity(targetId),
  (targetId, value) => dataStyleStore.setMeshEdgesOpacity(targetId, value),
);
const vertex_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshEdgesVertexAttributeName(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshEdgesVertexAttributeTimeStep(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeTimeStep(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshEdgesVertexAttributeItem(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshEdgesVertexAttributeRange(id),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeRange(targetId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshEdgesVertexAttributeColorMap(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshEdgesVertexAttributeNoDataColor(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshEdgesVertexAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeName(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const edge_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeTimeStep(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeTimeStep(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeItem(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeRange(id),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeRange(targetId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeColorMap(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeNoDataColor(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshEdgesEdgeAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

async function setVertexAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (targetId, minimum, maximum) =>
    dataStyleStore.setMeshEdgesVertexAttributeRange(targetId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}

async function setEdgeAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (targetId, minimum, maximum) =>
    dataStyleStore.setMeshEdgesEdgeAttributeRange(targetId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}
</script>

<template>
  <ViewerOptionsColoringTypeSelector
    :id="id"
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
  />
</template>
