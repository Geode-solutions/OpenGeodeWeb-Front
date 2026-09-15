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
  lineId?: string;
  targetLineIds: string[];
}

const { modelId, lineId = undefined, targetLineIds } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

// Visibility
const linesVisibility = computed<boolean>({
  get: () => dataStyleStore.modelComponentTypeVisibility(modelId, "Line"),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVisibility(
      modelId,
      targetLineIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const lineVisibility = computed<boolean | undefined>({
  get: () =>
    dataStyleStore.modelLineVisibility(modelId, lineId) as boolean | undefined,
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVisibility(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const linesColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelComponentTypeColor(modelId, "Line") as
      | RGBAColor
      | undefined,
  set: async (color) => {
    await dataStyleStore.setModelLinesColor(modelId, targetLineIds, color);
    hybridViewerStore.remoteRender();
  },
});

const lineColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelLineColor(modelId, lineId) as RGBAColor | undefined,
  set: async (color) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesColor(modelId, [lineId], color);
    hybridViewerStore.remoteRender();
  },
});

const linesActiveColoring = computed<string | undefined>({
  get: () =>
    dataStyleStore.getModelComponentTypeActiveColoring(modelId, "Line") as
      | string
      | undefined,
  set: async (coloringType) => {
    if (typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelLinesActiveColoring(
      modelId,
      targetLineIds,
      coloringType,
    );
    hybridViewerStore.remoteRender();
  },
});

const lineActiveColoring = computed<string | undefined>({
  get: () =>
    dataStyleStore.modelLineActiveColoring(modelId, lineId) as
      | string
      | undefined,
  set: async (coloringType) => {
    if (lineId === undefined || typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelLinesActiveColoring(
      modelId,
      [lineId],
      coloringType,
    );
    hybridViewerStore.remoteRender();
  },
});

// Group Attributes
const linesVertexAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeName(modelId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeName(
      modelId,
      targetLineIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeItem(modelId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeItem(
      modelId,
      targetLineIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeRange(modelId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeRange(
      modelId,
      targetLineIds,
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeColorMap = computed<RGBAColorMap | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeColorMap(
      modelId,
      targetLineIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelLinesVertexAttributeNoDataColor(modelId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeNoDataColor(
      modelId,
      targetLineIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeName(modelId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeName(
      modelId,
      targetLineIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeItem(modelId),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeItem(
      modelId,
      targetLineIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeRange(modelId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeRange(
      modelId,
      targetLineIds,
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeColorMap = computed<Map<string, RGBAColor> | undefined>(
  {
    get: () => dataStyleStore.modelLinesEdgeAttributeColorMap(modelId),
    set: async (newValue) => {
      await dataStyleStore.setModelLinesEdgeAttributeColorMap(
        modelId,
        targetLineIds,
        newValue,
      );
      hybridViewerStore.remoteRender();
    },
  },
);

const linesEdgeAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelLinesEdgeAttributeNoDataColor(modelId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeNoDataColor(
      modelId,
      targetLineIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeName(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeName(
      modelId,
      [lineId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeItem(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeItem(
      modelId,
      [lineId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeRange(modelId, lineId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (
      lineId === undefined ||
      minimum === undefined ||
      maximum === undefined
    ) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeRange(
      modelId,
      [lineId],
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed<ColorMap | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeColorMap(
      modelId,
      [lineId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelLinesVertexAttributeNoDataColor(modelId, lineId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeNoDataColor(
      modelId,
      [lineId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeName(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeName(
      modelId,
      [lineId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeItem(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeItem(
      modelId,
      [lineId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeRange(modelId, lineId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (
      lineId === undefined ||
      minimum === undefined ||
      maximum === undefined
    ) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeRange(
      modelId,
      [lineId],
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeColorMap(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeColorMap(
      modelId,
      [lineId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelLinesEdgeAttributeNoDataColor(modelId, lineId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeNoDataColor(
      modelId,
      [lineId],
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const capabilities = {
  color: { available: true },
  textures: { available: false },
  vertex: { available: true },
  edge: { available: true },
  cell: { available: false },
  polygon: { available: false },
  polyhedron: { available: false },
};

const vertexSchema =
  back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
const edgeSchema =
  back_schemas.opengeodeweb_back.model_component_edge_attribute_names;
</script>

<template>
  <OptionsSection
    title="Lines Options"
    class="mt-4"
    data-testid="modelComponentTypeOptions"
  >
    <VisibilitySwitch
      data-testid="modelLinesVisibilitySwitch"
      v-model="linesVisibility"
    />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentIds="targetLineIds"
      v-model:coloring_style_key="linesActiveColoring"
      v-model:color="linesColor"
      v-model:vertex_attribute_name="linesVertexAttributeName"
      v-model:vertex_attribute_item="linesVertexAttributeItem"
      v-model:vertex_attribute_range="linesVertexAttributeRange"
      v-model:vertex_attribute_color_map="linesVertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="linesVertexAttributeNoDataColor"
      v-model:edge_attribute_name="linesEdgeAttributeName"
      v-model:edge_attribute_item="linesEdgeAttributeItem"
      v-model:edge_attribute_range="linesEdgeAttributeRange"
      v-model:edge_attribute_color_map="linesEdgeAttributeColorMap"
      v-model:edge_attribute_no_data_color="linesEdgeAttributeNoDataColor"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema, edge: edgeSchema }"
      :allowRandom="true"
    />
  </OptionsSection>

  <OptionsSection
    v-if="lineId"
    title="Component Options"
    class="mt-4"
    data-testid="modelComponentOptions"
  >
    <VisibilitySwitch v-model="lineVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentIds="[lineId]"
      v-model:coloring_style_key="lineActiveColoring"
      v-model:color="lineColor"
      v-model:vertex_attribute_name="vertexAttributeName"
      v-model:vertex_attribute_item="vertexAttributeItem"
      v-model:vertex_attribute_range="vertexAttributeRange"
      v-model:vertex_attribute_color_map="vertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="vertexAttributeNoDataColor"
      v-model:edge_attribute_name="edgeAttributeName"
      v-model:edge_attribute_item="edgeAttributeItem"
      v-model:edge_attribute_range="edgeAttributeRange"
      v-model:edge_attribute_color_map="edgeAttributeColorMap"
      v-model:edge_attribute_no_data_color="edgeAttributeNoDataColor"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema, edge: edgeSchema }"
      :allowRandom="true"
    />
  </OptionsSection>
</template>
