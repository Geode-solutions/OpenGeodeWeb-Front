<script setup lang="ts">
import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
import type { DataId, MeshId } from "@ogw_front/types/identifiers";
import {
  type RangesPerData,
  applyRangesPerData,
  useBatchStyle,
} from "@ogw_front/composables/batch_style";
import type { Opacity } from "@ogw_front/types/style";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { Texture } from "@ogw_front/types/texture";
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
  get: () => dataStyleStore.meshPolygonsActiveColoring(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPolygonsActiveColoring(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = useBatchStyleModel<RGBAColor>(
  () => dataId,
  (meshId) => dataStyleStore.meshPolygonsColor(meshId) as RGBAColor | undefined,
  (meshId, value) => dataStyleStore.setMeshPolygonsColor(meshId, value),
);
const opacity = useBatchStyleModel<Opacity>(
  () => dataId,
  (meshId) => dataStyleStore.meshPolygonsOpacity(meshId),
  (meshId, value) => dataStyleStore.setMeshPolygonsOpacity(meshId, value),
);
const textures = useBatchStyleModel<Texture[]>(
  () => dataId,
  (meshId) => dataStyleStore.meshPolygonsTextures(meshId) as Texture[] | undefined,
  (meshId, value) => dataStyleStore.setMeshPolygonsTextures(meshId, value),
);

const vertex_attribute_name = computed<AttributeName | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeName(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsVertexAttributeName(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeTimeStep(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsVertexAttributeTimeStep(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<AttributeItem>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeItem(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsVertexAttributeItem(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeRange(dataId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsVertexAttributeRange(meshId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeColorMap(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsVertexAttributeColorMap(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeNoDataColor(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPolygonsVertexAttributeNoDataColor(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_name = computed<AttributeName | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeName(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsPolygonAttributeName(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const polygon_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeTimeStep(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsPolygonAttributeTimeStep(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_item = computed<AttributeItem>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeItem(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsPolygonAttributeItem(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeRange(dataId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsPolygonAttributeRange(meshId, minimum, maximum),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeColorMap(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsPolygonAttributeColorMap(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeNoDataColor(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPolygonsPolygonAttributeNoDataColor(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

async function setVertexAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (meshId, minimum, maximum) =>
    dataStyleStore.setMeshPolygonsVertexAttributeRange(meshId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}

async function setPolygonAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (meshId, minimum, maximum) =>
    dataStyleStore.setMeshPolygonsPolygonAttributeRange(meshId, minimum, maximum),
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
    v-model:textures="textures"
    v-model:vertex_attribute_name="vertex_attribute_name"
    v-model:vertex_attribute_item="vertex_attribute_item"
    v-model:vertex_attribute_range="vertex_attribute_range"
    @vertex_attribute_ranges_per_data="setVertexAttributeRangesPerData"
    v-model:vertex_attribute_color_map="vertex_attribute_color_map"
    v-model:vertex_attribute_no_data_color="vertex_attribute_no_data_color"
    v-model:vertex_attribute_time_step="vertex_attribute_time_step"
    v-model:polygon_attribute_name="polygon_attribute_name"
    v-model:polygon_attribute_item="polygon_attribute_item"
    v-model:polygon_attribute_range="polygon_attribute_range"
    @polygon_attribute_ranges_per_data="setPolygonAttributeRangesPerData"
    v-model:polygon_attribute_color_map="polygon_attribute_color_map"
    v-model:polygon_attribute_no_data_color="polygon_attribute_no_data_color"
    v-model:polygon_attribute_time_step="polygon_attribute_time_step"
    :capabilities="capabilities"
  />
</template>
