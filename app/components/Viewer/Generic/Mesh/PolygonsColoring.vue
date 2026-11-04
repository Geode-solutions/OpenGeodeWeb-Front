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

interface Texture {
  id: string;
  texture_name: string;
}

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  id: string;
  capabilities: Record<string, { available?: boolean; hasColorMap?: boolean }>;
}

const { id, capabilities } = defineProps<Props>();

const coloring_style_key = computed<string>({
  get: () => dataStyleStore.meshPolygonsActiveColoring(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshPolygonsActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = useBatchStyleModel<RGBAColor>(
  () => id,
  (targetId) => dataStyleStore.meshPolygonsColor(targetId) as RGBAColor | undefined,
  (targetId, value) => dataStyleStore.setMeshPolygonsColor(targetId, value),
);
const opacity = useBatchStyleModel<number>(
  () => id,
  (targetId) => dataStyleStore.meshPolygonsOpacity(targetId),
  (targetId, value) => dataStyleStore.setMeshPolygonsOpacity(targetId, value),
);
const textures = useBatchStyleModel<Texture[]>(
  () => id,
  (targetId) => dataStyleStore.meshPolygonsTextures(targetId) as Texture[] | undefined,
  (targetId, value) => dataStyleStore.setMeshPolygonsTextures(targetId, value),
);

const vertex_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeName(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsVertexAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeTimeStep(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsVertexAttributeTimeStep(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeItem(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsVertexAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeRange(id),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsVertexAttributeRange(targetId, minimum, maximum),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeColorMap(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsVertexAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeNoDataColor(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshPolygonsVertexAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeName(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsPolygonAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const polygon_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeTimeStep(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsPolygonAttributeTimeStep(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeItem(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsPolygonAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeRange(id),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsPolygonAttributeRange(targetId, minimum, maximum),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeColorMap(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolygonsPolygonAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeNoDataColor(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshPolygonsPolygonAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

async function setVertexAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (targetId, minimum, maximum) =>
    dataStyleStore.setMeshPolygonsVertexAttributeRange(targetId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}

async function setPolygonAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (targetId, minimum, maximum) =>
    dataStyleStore.setMeshPolygonsPolygonAttributeRange(targetId, minimum, maximum),
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
