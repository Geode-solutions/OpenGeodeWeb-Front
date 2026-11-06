<script setup lang="ts">
import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
import type { CornerId } from "@ogw_front/types/identifiers";
import { MODEL_VERTEX_COLORING } from "@ogw_front/utils/model_component_coloring";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import type { Visibility } from "@ogw_front/types/style";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  modelId: string;
  cornerId?: CornerId;
  activeTab?: string;
}

const { modelId, cornerId = undefined, activeTab = undefined } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const cornerComponentIds = computed<string[]>(() => (cornerId !== undefined && [cornerId]) || []);

const cornerVisibility = computed<Visibility | undefined>({
  get: () => dataStyleStore.modelCornerVisibility(modelId, cornerId) as boolean | undefined,
  set: async (newValue) => {
    if (newValue === undefined || cornerId === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVisibility(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornerColor = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.modelCornerColor(modelId, cornerId) as RGBAColor | undefined,
  set: async (color) => {
    if (cornerId === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersColor(modelId, [cornerId], color);
    hybridViewerStore.remoteRender();
  },
});

const cornerActiveColoring = computed<string | undefined>({
  get: () => dataStyleStore.modelCornerActiveColoring(modelId, cornerId) as string | undefined,
  set: async (coloringType) => {
    if (cornerId === undefined || typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelCornersActiveColoring(modelId, [cornerId], coloringType);
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed<AttributeName | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeName(modelId, cornerId),
  set: async (newValue) => {
    if (cornerId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeName(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeTimeStep = computed<number | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeTimeStep(modelId, cornerId),
  set: async (newValue) => {
    if (cornerId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeTimeStep(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeItem = computed<AttributeItem>({
  get: () => dataStyleStore.modelCornersVertexAttributeItem(modelId, cornerId),
  set: async (newValue) => {
    if (cornerId === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeItem(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeRange(modelId, cornerId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (cornerId === undefined || minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeRange(modelId, [cornerId], minimum, maximum);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed<ColorMap | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeColorMap(modelId, cornerId),
  set: async (newValue) => {
    if (cornerId === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeColorMap(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeNoDataColor = computed<RGBAColor>({
  get: () => dataStyleStore.modelCornersVertexAttributeNoDataColor(modelId, cornerId),
  set: async (newValue) => {
    if (cornerId === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeNoDataColor(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const { capabilities, schemas: attributeSchemas } = MODEL_VERTEX_COLORING;
</script>

<template>
  <div v-show="!activeTab || activeTab === 'component'" data-testid="modelComponentOptions">
    <VisibilitySwitch v-model="cornerVisibility" />
    <ViewerOptionsColoringTypeSelector
      :data-id="modelId"
      :componentIds="cornerComponentIds"
      v-model:coloring_style_key="cornerActiveColoring"
      v-model:color="cornerColor"
      v-model:vertex_attribute_name="vertexAttributeName"
      v-model:vertex_attribute_item="vertexAttributeItem"
      v-model:vertex_attribute_range="vertexAttributeRange"
      v-model:vertex_attribute_color_map="vertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="vertexAttributeNoDataColor"
      v-model:vertex_attribute_time_step="vertexAttributeTimeStep"
      :capabilities="capabilities"
      :schemas="attributeSchemas"
      :allowRandom="true"
    />
  </div>
</template>
