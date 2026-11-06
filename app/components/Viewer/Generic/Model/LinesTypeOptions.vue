<script setup lang="ts">
import type { CollectionComponent } from "@ogw_front/stores/data_helpers/collections";
import { MODEL_LINE_COLORING } from "@ogw_front/utils/model_component_coloring";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  modelId: string;
  targetLineIds: string[];
  collections?: CollectionComponent[];
  activeTab?: string;
}

const {
  modelId,
  targetLineIds,
  collections = undefined,
  activeTab = undefined,
} = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const referenceLineId = computed<string | undefined>(() =>
  collections ? targetLineIds[0] : undefined,
);

// Visibility
const linesVisibility = computed<boolean>({
  get: () => {
    if (collections) {
      return targetLineIds.every((id) => dataStyleStore.modelLineVisibility(modelId, id));
    }
    return dataStyleStore.modelComponentTypeVisibility(modelId, "Line");
  },
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVisibility(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const linesColor = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.modelLineColor(modelId, referenceLineId.value) as RGBAColor | undefined,
  set: async (color) => {
    await dataStyleStore.setModelLinesColor(modelId, targetLineIds, color);
    hybridViewerStore.remoteRender();
  },
});

const linesActiveColoring = computed<string | undefined>({
  get: () =>
    dataStyleStore.modelLineActiveColoring(modelId, referenceLineId.value) as string | undefined,
  set: async (coloringType) => {
    if (typeof coloringType !== "string") {
      return;
    }
    if (collections && coloringType === "random") {
      await Promise.all(
        collections.map((collection) =>
          dataStyleStore.setModelLinesActiveColoring(
            modelId,
            collection.children.map((child) => child.id),
            coloringType,
            collection.id,
          ),
        ),
      );
    } else {
      await dataStyleStore.setModelLinesActiveColoring(modelId, targetLineIds, coloringType);
    }
    hybridViewerStore.remoteRender();
  },
});

// Group Attributes
const linesVertexAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeName(modelId, referenceLineId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeName(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeTimeStep = computed<number | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeTimeStep(modelId, referenceLineId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesVertexAttributeTimeStep(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeItem(modelId, referenceLineId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeItem(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelLinesVertexAttributeRange(modelId, referenceLineId.value),
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
  get: () => dataStyleStore.modelLinesVertexAttributeColorMap(modelId, referenceLineId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeColorMap(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesVertexAttributeNoDataColor = computed<RGBAColor>({
  get: () => dataStyleStore.modelLinesVertexAttributeNoDataColor(modelId, referenceLineId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesVertexAttributeNoDataColor(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeName(modelId, referenceLineId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeName(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeTimeStep = computed<number | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeTimeStep(modelId, referenceLineId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeTimeStep(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeItem(modelId, referenceLineId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeItem(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeRange(modelId, referenceLineId.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelLinesEdgeAttributeRange(modelId, targetLineIds, minimum, maximum);
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelLinesEdgeAttributeColorMap(modelId, referenceLineId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeColorMap(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const linesEdgeAttributeNoDataColor = computed<RGBAColor>({
  get: () => dataStyleStore.modelLinesEdgeAttributeNoDataColor(modelId, referenceLineId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelLinesEdgeAttributeNoDataColor(modelId, targetLineIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const { capabilities, schemas: attributeSchemas } = MODEL_LINE_COLORING;
</script>

<template>
  <div v-show="!activeTab || activeTab === 'type'" data-testid="modelComponentTypeOptions">
    <VisibilitySwitch data-testid="modelLinesVisibilitySwitch" v-model="linesVisibility" />
    <ViewerOptionsColoringTypeSelector
      :data-id="modelId"
      :componentIds="targetLineIds"
      v-model:coloring_style_key="linesActiveColoring"
      v-model:color="linesColor"
      v-model:vertex_attribute_name="linesVertexAttributeName"
      v-model:vertex_attribute_item="linesVertexAttributeItem"
      v-model:vertex_attribute_range="linesVertexAttributeRange"
      v-model:vertex_attribute_color_map="linesVertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="linesVertexAttributeNoDataColor"
      v-model:vertex_attribute_time_step="linesVertexAttributeTimeStep"
      v-model:edge_attribute_name="linesEdgeAttributeName"
      v-model:edge_attribute_item="linesEdgeAttributeItem"
      v-model:edge_attribute_range="linesEdgeAttributeRange"
      v-model:edge_attribute_color_map="linesEdgeAttributeColorMap"
      v-model:edge_attribute_no_data_color="linesEdgeAttributeNoDataColor"
      v-model:edge_attribute_time_step="linesEdgeAttributeTimeStep"
      :capabilities="capabilities"
      :schemas="attributeSchemas"
      :allowRandom="true"
    />
  </div>
</template>
