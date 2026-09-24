<script setup lang="ts">
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  modelId: string;
  blockId?: string;
  targetBlockIds: string[];
  isCollection?: boolean;
}

const { modelId, blockId = undefined, targetBlockIds, isCollection } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const referenceBlockId = computed<string | undefined>(() =>
  isCollection ? targetBlockIds[0] : undefined,
);

// Visibility
const blocksVisibility = computed<boolean>({
  get: () =>
    isCollection
      ? targetBlockIds.every((id) => dataStyleStore.modelBlockVisibility(modelId, id))
      : dataStyleStore.modelComponentTypeVisibility(modelId, "Block"),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVisibility(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const blockVisibility = computed<boolean | undefined>({
  get: () => dataStyleStore.modelBlockVisibility(modelId, blockId) as boolean | undefined,
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
    dataStyleStore.modelBlockColor(modelId, referenceBlockId.value) as RGBAColor | undefined,
  set: async (color) => {
    await dataStyleStore.setModelBlocksColor(modelId, targetBlockIds, color);
    hybridViewerStore.remoteRender();
  },
});

const blockColor = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.modelBlockColor(modelId, blockId) as RGBAColor | undefined,
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
    dataStyleStore.modelBlockActiveColoring(modelId, referenceBlockId.value) as string | undefined,
  set: async (coloringType) => {
    if (typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelBlocksActiveColoring(modelId, targetBlockIds, coloringType);
    hybridViewerStore.remoteRender();
  },
});

const blockActiveColoring = computed<string | undefined>({
  get: () => dataStyleStore.modelBlockActiveColoring(modelId, blockId) as string | undefined,
  set: async (coloringType) => {
    if (blockId === undefined || typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelBlocksActiveColoring(modelId, [blockId], coloringType);
    hybridViewerStore.remoteRender();
  },
});

// Group Attributes
const blocksVertexAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelBlocksVertexAttributeName(modelId, referenceBlockId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeName(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const blocksVertexAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelBlocksVertexAttributeItem(modelId, referenceBlockId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeItem(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const blocksVertexAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelBlocksVertexAttributeRange(modelId, referenceBlockId.value),
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

const blocksVertexAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelBlocksVertexAttributeColorMap(modelId, referenceBlockId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksVertexAttributeColorMap(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const blocksVertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelBlocksVertexAttributeNoDataColor(modelId, referenceBlockId.value) as
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

const blocksPolyhedronAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeName(modelId, referenceBlockId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeName(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeItem(modelId, referenceBlockId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelBlocksPolyhedronAttributeItem(modelId, targetBlockIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const blocksPolyhedronAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeRange(modelId, referenceBlockId.value),
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

const blocksPolyhedronAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeColorMap(modelId, referenceBlockId.value),
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
    dataStyleStore.modelBlocksPolyhedronAttributeNoDataColor(modelId, referenceBlockId.value) as
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
const vertexAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelBlocksVertexAttributeName(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeName(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelBlocksVertexAttributeItem(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeItem(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelBlocksVertexAttributeRange(modelId, blockId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (blockId === undefined || minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeRange(modelId, [blockId], minimum, maximum);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelBlocksVertexAttributeColorMap(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeColorMap(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelBlocksVertexAttributeNoDataColor(modelId, blockId) as RGBAColor | undefined,
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksVertexAttributeNoDataColor(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeName(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeName(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeItem(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeItem(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeRange(modelId, blockId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (blockId === undefined || minimum === undefined || maximum === undefined) {
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

const polyhedronAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelBlocksPolyhedronAttributeColorMap(modelId, blockId),
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeColorMap(modelId, [blockId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polyhedronAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelBlocksPolyhedronAttributeNoDataColor(modelId, blockId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    if (blockId === undefined) {
      return;
    }
    await dataStyleStore.setModelBlocksPolyhedronAttributeNoDataColor(modelId, [blockId], newValue);
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

const vertexSchema = back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
const polyhedronSchema = back_schemas.opengeodeweb_back.model_component_polyhedron_attribute_names;
</script>

<template>
  <OptionsSection title="Blocks Options" class="mt-4" data-testid="modelComponentTypeOptions">
    <VisibilitySwitch data-testid="modelBlocksVisibilitySwitch" v-model="blocksVisibility" />
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
      v-model:polyhedron_attribute_no_data_color="blocksPolyhedronAttributeNoDataColor"
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
      v-model:polyhedron_attribute_no_data_color="polyhedronAttributeNoDataColor"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema, polyhedron: polyhedronSchema }"
      :allowRandom="true"
    />
  </OptionsSection>
</template>
