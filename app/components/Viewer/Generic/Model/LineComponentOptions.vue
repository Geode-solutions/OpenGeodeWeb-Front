<script setup lang="ts">
import type {
  AttributeColorMap,
  AttributeRange,
  AttributeTimeStep,
  ColoringType,
} from "@ogw_front/types/attribute";
import type {
  AttributeItem,
  AttributeName,
  ColorRGBA,
  Visibility,
} from "@geode/opengeodeweb-viewer/schema_types";
import type { LineId, ModelId } from "@ogw_front/types/identifiers";
import { MODEL_LINE_COLORING } from "@ogw_front/utils/model_component_coloring";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import type { TabName } from "@ogw_front/types/ui";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  modelId: ModelId;
  lineId: LineId | undefined;
  activeTab: TabName | undefined;
}

const { modelId, lineId, activeTab } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const lineComponentIds = computed<NonEmptyArray<LineId> | undefined>(() => {
  if (lineId === undefined) {
    return undefined;
  }
  return [lineId];
});

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

const lineColor = computed<ColorRGBA | undefined>({
  get: () => dataStyleStore.modelLineColor(modelId, lineId) as ColorRGBA | undefined,
  set: async (color) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesColor(modelId, [lineId], color);
    hybridViewerStore.remoteRender();
  },
});

const lineActiveColoring = computed<ColoringType | undefined>({
  get: () => dataStyleStore.modelLineActiveColoring(modelId, lineId) as ColoringType | undefined,
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

const vertexAttributeTimeStep = computed<AttributeTimeStep | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeTimeStep(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeTimeStep(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeItem = computed<AttributeItem>({
  get: () => dataStyleStore.modelLinesVertexAttributeItem(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeItem(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed<AttributeRange>({
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

const vertexAttributeColorMap = computed<AttributeColorMap | undefined, AttributeColorMap>({
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeColorMap(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeNoDataColor = computed<ColorRGBA>({
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

const edgeAttributeTimeStep = computed<AttributeTimeStep | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeTimeStep(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeTimeStep(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeItem = computed<AttributeItem>({
  get: () => dataStyleStore.modelLinesEdgeAttributeItem(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeItem(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeRange = computed<AttributeRange>({
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

const edgeAttributeColorMap = computed<AttributeColorMap | undefined, AttributeColorMap>({
  get: () => dataStyleStore.modelLinesEdgeAttributeColorMap(modelId, lineId),
  set: async (newValue) => {
    if (lineId === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeColorMap(modelId, [lineId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const edgeAttributeNoDataColor = computed<ColorRGBA>({
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
      v-if="lineComponentIds"
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
