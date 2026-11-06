<script setup lang="ts">
import type { AttributeName } from "@ogw_front/types/attribute";
import type { LineId } from "@ogw_front/types/identifiers";
import { MODEL_LINE_COLORING } from "@ogw_front/utils/model_component_coloring";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import type { Visibility } from "@ogw_front/types/style";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  modelId: string;
  lineId?: LineId;
  activeTab?: string;
}

const { modelId, lineId = undefined, activeTab = undefined } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const lineComponentIds = computed<string[]>(() => (lineId !== undefined && [lineId]) || []);

const lineVisibility = computed<Visibility | undefined>({
  get: () => dataStyleStore.modelLineVisibility(modelId, lineId) as boolean | undefined,
  set: async (newValue) => {
    if (newValue === undefined || lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVisibility(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const lineColor = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.modelLineColor(modelId, lineId) as RGBAColor | undefined,
  set: async (color) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesColor(modelId, [lineId], color);
    hybridViewerStore.remoteRender();
  },
});

const lineActiveColoring = computed<string | undefined>({
  get: () => dataStyleStore.modelLineActiveColoring(modelId, lineId) as string | undefined,
  set: async (coloringType) => {
    if (lineId === undefined || typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelLinesActiveColoring(modelId, [lineId], coloringType);
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed<AttributeName | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeName(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeName(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeTimeStep = computed<number | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeTimeStep(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeTimeStep(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeItem(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeItem(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeRange(modelId, lineId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (lineId === undefined || minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeRange(modelId, [lineId], minimum, maximum);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed<ColorMap | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeColorMap(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeNoDataColor = computed<RGBAColor>({
  get: () => dataStyleStore.modelLinesVertexAttributeNoDataColor(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeNoDataColor(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeName = computed<AttributeName | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeName(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeName(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeTimeStep = computed<number | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeTimeStep(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeTimeStep(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeItem(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeItem(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeRange(modelId, lineId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (lineId === undefined || minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeRange(modelId, [lineId], minimum, maximum);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeColorMap(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeColorMap(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeNoDataColor = computed<RGBAColor>({
  get: () => dataStyleStore.modelLinesEdgeAttributeNoDataColor(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeNoDataColor(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const { capabilities, schemas: attributeSchemas } = MODEL_LINE_COLORING;
</script>

<template>
  <div v-show="!activeTab || activeTab === 'component'" data-testid="modelComponentOptions">
    <VisibilitySwitch v-model="lineVisibility" />
    <ViewerOptionsColoringTypeSelector
      :data-id="modelId"
      :componentIds="lineComponentIds"
      v-model:coloring_style_key="lineActiveColoring"
      v-model:color="lineColor"
      v-model:vertex_attribute_name="vertexAttributeName"
      v-model:vertex_attribute_item="vertexAttributeItem"
      v-model:vertex_attribute_range="vertexAttributeRange"
      v-model:vertex_attribute_color_map="vertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="vertexAttributeNoDataColor"
      v-model:vertex_attribute_time_step="vertexAttributeTimeStep"
      v-model:edge_attribute_name="edgeAttributeName"
      v-model:edge_attribute_item="edgeAttributeItem"
      v-model:edge_attribute_range="edgeAttributeRange"
      v-model:edge_attribute_color_map="edgeAttributeColorMap"
      v-model:edge_attribute_no_data_color="edgeAttributeNoDataColor"
      v-model:edge_attribute_time_step="edgeAttributeTimeStep"
      :capabilities="capabilities"
      :schemas="attributeSchemas"
      :allowRandom="true"
    />
  </div>
</template>
