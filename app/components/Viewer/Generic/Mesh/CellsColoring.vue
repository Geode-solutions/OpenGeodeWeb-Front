<script setup lang="ts">
import type { AttributeItem, AttributeName, AttributeRange } from "@ogw_front/types/attribute";
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
}

const { dataId } = defineProps<Props>();

const coloring_style_key = computed<string>({
  get: () => dataStyleStore.meshCellsActiveColoring(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshCellsActiveColoring(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = useBatchStyleModel<RGBAColor>(
  () => dataId,
  (meshId) => dataStyleStore.meshCellsColor(meshId) as RGBAColor | undefined,
  (meshId, value) => dataStyleStore.setMeshCellsColor(meshId, value),
);
const opacity = useBatchStyleModel<Opacity>(
  () => dataId,
  (meshId) => dataStyleStore.meshCellsOpacity(meshId),
  (meshId, value) => dataStyleStore.setMeshCellsOpacity(meshId, value),
);
const textures = useBatchStyleModel<Texture[]>(
  () => dataId,
  (meshId) => dataStyleStore.meshCellsTextures(meshId) as Texture[] | undefined,
  (meshId, value) => dataStyleStore.setMeshCellsTextures(meshId, value),
);

const vertex_attribute_name = computed<AttributeName | undefined>({
  get: () => dataStyleStore.meshCellsVertexAttributeName(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeName(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshCellsVertexAttributeTimeStep(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeTimeStep(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<AttributeItem>({
  get: () => dataStyleStore.meshCellsVertexAttributeItem(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeItem(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<AttributeRange>({
  get: () => dataStyleStore.meshCellsVertexAttributeRange(dataId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeRange(meshId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshCellsVertexAttributeColorMap(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeColorMap(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshCellsVertexAttributeNoDataColor(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshCellsVertexAttributeNoDataColor(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_name = computed<AttributeName | undefined>({
  get: () => dataStyleStore.meshCellsCellAttributeName(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeName(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const cell_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshCellsCellAttributeTimeStep(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeTimeStep(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_item = computed<AttributeItem>({
  get: () => dataStyleStore.meshCellsCellAttributeItem(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeItem(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_range = computed<AttributeRange>({
  get: () => dataStyleStore.meshCellsCellAttributeRange(dataId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeRange(meshId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshCellsCellAttributeColorMap(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeColorMap(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshCellsCellAttributeNoDataColor(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshCellsCellAttributeNoDataColor(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

async function setVertexAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (meshId, minimum, maximum) =>
    dataStyleStore.setMeshCellsVertexAttributeRange(meshId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}

async function setCellAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (meshId, minimum, maximum) =>
    dataStyleStore.setMeshCellsCellAttributeRange(meshId, minimum, maximum),
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
    v-model:cell_attribute_name="cell_attribute_name"
    v-model:cell_attribute_item="cell_attribute_item"
    v-model:cell_attribute_range="cell_attribute_range"
    @cell_attribute_ranges_per_data="setCellAttributeRangesPerData"
    v-model:cell_attribute_color_map="cell_attribute_color_map"
    v-model:cell_attribute_no_data_color="cell_attribute_no_data_color"
    v-model:cell_attribute_time_step="cell_attribute_time_step"
  />
</template>
