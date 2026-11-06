<script setup lang="ts">
import {
  type RangesPerData,
  applyRangesPerData,
  useBatchStyle,
} from "@ogw_front/composables/batch_style";
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
  id: string;
}

const { id } = defineProps<Props>();

const coloring_style_key = computed<string>({
  get: () => dataStyleStore.meshCellsActiveColoring(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshCellsActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = useBatchStyleModel<RGBAColor>(
  () => id,
  (targetId) => dataStyleStore.meshCellsColor(targetId) as RGBAColor | undefined,
  (targetId, value) => dataStyleStore.setMeshCellsColor(targetId, value),
);
const opacity = useBatchStyleModel<number>(
  () => id,
  (targetId) => dataStyleStore.meshCellsOpacity(targetId),
  (targetId, value) => dataStyleStore.setMeshCellsOpacity(targetId, value),
);
const textures = useBatchStyleModel<Texture[]>(
  () => id,
  (targetId) => dataStyleStore.meshCellsTextures(targetId) as Texture[] | undefined,
  (targetId, value) => dataStyleStore.setMeshCellsTextures(targetId, value),
);

const vertex_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshCellsVertexAttributeName(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshCellsVertexAttributeTimeStep(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeTimeStep(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshCellsVertexAttributeItem(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshCellsVertexAttributeRange(id),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeRange(targetId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshCellsVertexAttributeColorMap(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsVertexAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshCellsVertexAttributeNoDataColor(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshCellsVertexAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshCellsCellAttributeName(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const cell_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshCellsCellAttributeTimeStep(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeTimeStep(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshCellsCellAttributeItem(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshCellsCellAttributeRange(id),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeRange(targetId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshCellsCellAttributeColorMap(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshCellsCellAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshCellsCellAttributeNoDataColor(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshCellsCellAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

async function setVertexAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (targetId, minimum, maximum) =>
    dataStyleStore.setMeshCellsVertexAttributeRange(targetId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}

async function setCellAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (targetId, minimum, maximum) =>
    dataStyleStore.setMeshCellsCellAttributeRange(targetId, minimum, maximum),
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
