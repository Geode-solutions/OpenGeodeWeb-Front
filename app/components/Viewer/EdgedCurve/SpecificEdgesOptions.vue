<script setup lang="ts">
// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import EdgedCurveEdges from "@ogw_front/assets/viewer_svgs/edged_curve_edges.svg";
// oxlint-disable import/consistent-type-specifier-style -- combining the default import with the type import avoids a duplicate-imports violation on this same module; using disable-next-line here is fragile because a formatter can re-wrap the import onto multiple lines and shift the flagged line
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import ViewerOptionsWidthSlider from "@ogw_front/components/Viewer/Options/Sliders/Width.vue";

import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();

const id = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshEdgesVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshEdgesVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const width = computed({
  get: () => dataStyleStore.meshEdgesWidth(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshEdgesWidth(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshEdgesActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshEdgesActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.meshEdgesColor(id.value) as RGBAColor | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshEdgesColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed({
  get: () => dataStyleStore.meshEdgesVertexAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed({
  get: () => dataStyleStore.meshEdgesVertexAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed({
  get: () => dataStyleStore.meshEdgesVertexAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeRange(targetId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed({
  get: () => dataStyleStore.meshEdgesVertexAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesVertexAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.meshEdgesVertexAttributeNoDataColor(id.value) as RGBAColor | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshEdgesVertexAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_name = computed({
  get: () => dataStyleStore.meshEdgesEdgeAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_item = computed({
  get: () => dataStyleStore.meshEdgesEdgeAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_range = computed({
  get: () => dataStyleStore.meshEdgesEdgeAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeRange(targetId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_color_map = computed({
  get: () => dataStyleStore.meshEdgesEdgeAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshEdgesEdgeAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const edge_attribute_no_data_color = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.meshEdgesEdgeAttributeNoDataColor(id.value) as RGBAColor | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshEdgesEdgeAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshEdgesMenu"
    :index="itemProps.index!"
    :itemProps="itemProps"
    :btnImage="EdgedCurveEdges"
    tooltip="Edges options"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch data-testid="meshEdgesVisibilitySwitch" v-model="visibility" />
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsWidthSlider data-testid="meshEdgesWidthSlider" v-model="width" />
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_item="vertex_attribute_item"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:vertex_attribute_no_data_color="vertex_attribute_no_data_color"
          v-model:edge_attribute_name="edge_attribute_name"
          v-model:edge_attribute_item="edge_attribute_item"
          v-model:edge_attribute_range="edge_attribute_range"
          v-model:edge_attribute_color_map="edge_attribute_color_map"
          v-model:edge_attribute_no_data_color="edge_attribute_no_data_color"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
