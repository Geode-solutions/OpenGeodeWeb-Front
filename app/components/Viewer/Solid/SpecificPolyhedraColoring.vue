<script setup lang="ts">
import {
  type RangesPerData,
  applyRangesPerData,
  useBatchStyle,
} from "@ogw_front/composables/batch_style";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
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
  get: () => dataStyleStore.meshPolyhedraActiveColoring(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.meshPolyhedraColor(id) as RGBAColor | undefined,
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeName(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeTimeStep(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeTimeStep(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeItem(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeRange(id),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolyhedraVertexAttributeRange(targetId, minimum, maximum),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeColorMap(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeNoDataColor(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraVertexAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeName(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const polyhedron_attribute_time_step = computed<number | undefined>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeTimeStep(id),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolyhedraPolyhedronAttributeTimeStep(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeItem(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraPolyhedronAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeRange(id),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolyhedraPolyhedronAttributeRange(targetId, minimum, maximum),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_color_map = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeNoDataColor(id),
  set: async (newValue) => {
    await applyBatchStyle(id, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraPolyhedronAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

async function setVertexAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (targetId, minimum, maximum) =>
    dataStyleStore.setMeshPolyhedraVertexAttributeRange(targetId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}

async function setPolyhedronAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (targetId, minimum, maximum) =>
    dataStyleStore.setMeshPolyhedraPolyhedronAttributeRange(targetId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}
</script>

<template>
  <ViewerOptionsColoringTypeSelector
    :id="id"
    v-model:coloring_style_key="coloring_style_key"
    v-model:color="color"
    v-model:vertex_attribute_name="vertex_attribute_name"
    v-model:vertex_attribute_item="vertex_attribute_item"
    v-model:vertex_attribute_range="vertex_attribute_range"
    @vertex_attribute_ranges_per_data="setVertexAttributeRangesPerData"
    v-model:vertex_attribute_color_map="vertex_attribute_color_map"
    v-model:vertex_attribute_no_data_color="vertex_attribute_no_data_color"
    v-model:vertex_attribute_time_step="vertex_attribute_time_step"
    v-model:polyhedron_attribute_name="polyhedron_attribute_name"
    v-model:polyhedron_attribute_item="polyhedron_attribute_item"
    v-model:polyhedron_attribute_range="polyhedron_attribute_range"
    @polyhedron_attribute_ranges_per_data="setPolyhedronAttributeRangesPerData"
    v-model:polyhedron_attribute_color_map="polyhedron_attribute_color_map"
    v-model:polyhedron_attribute_no_data_color="polyhedron_attribute_no_data_color"
    v-model:polyhedron_attribute_time_step="polyhedron_attribute_time_step"
  />
</template>
