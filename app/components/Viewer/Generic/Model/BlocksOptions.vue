<script setup lang="ts">
// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
// This file exhaustively wires group- and per-component style properties (visibility/color/coloring/vertex+polyhedron attributes) to the style store; the formatter's line-wrapping of the resulting store calls pushes the file past max-lines even though no logic was added.
// oxlint-disable eslint/max-lines
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface Props {
  modelId: string;
  blockId?: string;
  targetBlockIds: string[];
}

const { modelId, blockId = undefined, targetBlockIds } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

// Visibility
const blocksVisibility = computed({
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Block"),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVisibility(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const blockVisibility = computed({
  get: () =>
    dataStyleStore.modelBlockVisibility(modelId, blockId) as
      | boolean
      | undefined,
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVisibility(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const blocksColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelComponentTypeColor(modelId, "Block") as
      | RGBAColor
      | undefined,
  set: async (color) => {
    await dataStyleStore.setModelBlocksColor(modelId, targetBlockIds, color);
    hybridViewerStore.remoteRender();
  },
});

const blockColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelBlockColor(modelId, blockId) as RGBAColor | undefined,
  set: async (color) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksColor(modelId, [blockId], color);
    hybridViewerStore.remoteRender();
  },
});

const blocksActiveColoring = computed<string | undefined>({
  get: () =>
    dataStyleStore.getModelComponentTypeActiveColoring(modelId, "Block") as
      | string
      | undefined,
  set: async (coloringType) => {
    if (typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelBlocksActiveColoring(
      modelId,
      targetBlockIds,
      coloringType,
    );
    hybridViewerStore.remoteRender();
  },
});

const blockActiveColoring = computed<string | undefined>({
  get: () =>
    dataStyleStore.modelBlockActiveColoring(modelId, blockId) as
      | string
      | undefined,
  set: async (coloringType) => {
    if (blockId === undefined || typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelBlocksActiveColoring(
      modelId,
      [blockId],
      coloringType,
    );
    hybridViewerStore.remoteRender();
  },
});

// Group Attributes
const blocksVertexAttributeName = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeName(modelId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeName(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksVertexAttributeItem = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeItem(modelId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeItem(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksVertexAttributeRange = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeRange(modelId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeRange(
      modelId,
      targetBlockIds,
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksVertexAttributeColorMap = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeColorMap(modelId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeColorMap(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksVertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelBlocksVertexAttributeNoDataColor(modelId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeNoDataColor(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeName = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeName(modelId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeName(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeItem = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeItem(modelId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeItem(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeRange = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeRange(modelId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeRange(
      modelId,
      targetBlockIds,
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeColorMap = computed({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeColorMap(modelId),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeColorMap(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelBlocksPolyhedronAttributeNoDataColor(modelId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeNoDataColor(
      modelId,
      targetBlockIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeName(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeName(
      modelId,
      [blockId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeItem = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeItem(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeItem(
      modelId,
      [blockId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed({
  get: () => dataStyleStore.modelBlocksVertexAttributeRange(modelId, blockId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (
      blockId === undefined ||
      minimum === undefined ||
      maximum === undefined
    ) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeRange(
      modelId,
      [blockId],
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelBlocksVertexAttributeColorMap(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeColorMap(
      modelId,
      [blockId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelBlocksVertexAttributeNoDataColor(modelId, blockId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeNoDataColor(
      modelId,
      [blockId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeName = computed({
  get: () =>
    dataStyleStore.modelBlocksPolyhedronAttributeName(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeName(
      modelId,
      [blockId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeItem = computed({
  get: () =>
    dataStyleStore.modelBlocksPolyhedronAttributeItem(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeItem(
      modelId,
      [blockId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeRange = computed({
  get: () =>
    dataStyleStore.modelBlocksPolyhedronAttributeRange(modelId, blockId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (
      blockId === undefined ||
      minimum === undefined ||
      maximum === undefined
    ) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeRange(
      modelId,
      [blockId],
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeColorMap = computed({
  get: () =>
    dataStyleStore.modelBlocksPolyhedronAttributeColorMap(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeColorMap(
      modelId,
      [blockId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelBlocksPolyhedronAttributeNoDataColor(
      modelId,
      blockId,
    ) as RGBAColor | undefined,
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeNoDataColor(
      modelId,
      [blockId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const capabilities = {
  color: { available: true },
  textures: { available: false },
  vertex: { available: true },
  edge: { available: false },
  cell: { available: false },
  polygon: { available: false },
  polyhedron: { available: true },
};

const vertexSchema =
  back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
const polyhedronSchema =
  back_schemas.opengeodeweb_back.model_component_polyhedron_attribute_names;
</script>

<template>
  <OptionsSection
    title="Blocks Options"
    class="mt-4"
    data-testid="modelComponentTypeOptions"
  >
    <VisibilitySwitch
      data-testid="modelBlocksVisibilitySwitch"
      v-model="blocksVisibility"
    />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentIds="targetBlockIds"
      v-model:coloring_style_key="blocksActiveColoring"
      v-model:color="blocksColor"
      v-model:vertex_attribute_name="blocksVertexAttributeName"
      v-model:vertex_attribute_item="blocksVertexAttributeItem"
      v-model:vertex_attribute_range="blocksVertexAttributeRange"
      v-model:vertex_attribute_color_map="blocksVertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="blocksVertexAttributeNoDataColor"
      v-model:polyhedron_attribute_name="blocksPolyhedronAttributeName"
      v-model:polyhedron_attribute_item="blocksPolyhedronAttributeItem"
      v-model:polyhedron_attribute_range="blocksPolyhedronAttributeRange"
      v-model:polyhedron_attribute_color_map="blocksPolyhedronAttributeColorMap"
      v-model:polyhedron_attribute_no_data_color="
        blocksPolyhedronAttributeNoDataColor
      "
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema, polyhedron: polyhedronSchema }"
      :allowRandom="true"
    />
  </OptionsSection>

  <OptionsSection
    v-if="blockId"
    title="Component Options"
    class="mt-4"
    data-testid="modelComponentOptions"
  >
    <VisibilitySwitch v-model="blockVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentIds="[blockId]"
      v-model:coloring_style_key="blockActiveColoring"
      v-model:color="blockColor"
      v-model:vertex_attribute_name="vertexAttributeName"
      v-model:vertex_attribute_item="vertexAttributeItem"
      v-model:vertex_attribute_range="vertexAttributeRange"
      v-model:vertex_attribute_color_map="vertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="vertexAttributeNoDataColor"
      v-model:polyhedron_attribute_name="polyhedronAttributeName"
      v-model:polyhedron_attribute_item="polyhedronAttributeItem"
      v-model:polyhedron_attribute_range="polyhedronAttributeRange"
      v-model:polyhedron_attribute_color_map="polyhedronAttributeColorMap"
      v-model:polyhedron_attribute_no_data_color="
        polyhedronAttributeNoDataColor
      "
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema, polyhedron: polyhedronSchema }"
      :allowRandom="true"
    />
  </OptionsSection>
</template>
