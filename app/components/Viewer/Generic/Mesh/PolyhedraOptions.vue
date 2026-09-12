<script setup lang="ts">
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";

import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const { itemProps, btnImage, tooltip } = defineProps({
  itemProps: { type: Object, required: true },
  btnImage: { type: String, required: true },
  tooltip: { type: String, required: false, default: "Polyhedra options" },
});

const id = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshPolyhedraVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshPolyhedraActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed({
  get: () => dataStyleStore.meshPolyhedraColor(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) return;
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) return;
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeRange(targetId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeNoDataColor(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraVertexAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_name = computed({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) return;
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_item = computed({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraPolyhedronAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_range = computed({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) return;
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolyhedraPolyhedronAttributeRange(targetId, minimum, maximum),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_color_map = computed({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_no_data_color = computed({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeNoDataColor(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraPolyhedronAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshPolyhedraMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="btnImage"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolyhedraVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-divider />
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_item="vertex_attribute_item"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:vertex_attribute_no_data_color="vertex_attribute_no_data_color"
          v-model:polyhedron_attribute_name="polyhedron_attribute_name"
          v-model:polyhedron_attribute_item="polyhedron_attribute_item"
          v-model:polyhedron_attribute_range="polyhedron_attribute_range"
          v-model:polyhedron_attribute_color_map="polyhedron_attribute_color_map"
          v-model:polyhedron_attribute_no_data_color="polyhedron_attribute_no_data_color"
          :capabilities="{
            vertex: { available: true, hasColorMap: true },
            polyhedron: { available: true, hasColorMap: true },
          }"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
