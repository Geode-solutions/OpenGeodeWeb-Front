<script setup lang="ts">
import type { AttributeItem, AttributeName, AttributeRange } from "@ogw_front/types/attribute";
import type { CollectionComponent } from "@ogw_front/stores/data_helpers/collections";
import { MODEL_VERTEX_COLORING } from "@ogw_front/utils/model_component_coloring";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import type { Visibility } from "@ogw_front/types/style";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  modelId: string;
  targetCornerIds: string[];
  collections?: CollectionComponent[];
  activeTab?: string;
}

const {
  modelId,
  targetCornerIds,
  collections = undefined,
  activeTab = undefined,
} = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const referenceCornerId = computed<string | undefined>(() =>
  collections ? targetCornerIds[0] : undefined,
);

// Visibility
const cornersVisibility = computed<Visibility>({
  get: () => {
    if (collections) {
      return targetCornerIds.every((id) => dataStyleStore.modelCornerVisibility(modelId, id));
    }
    return dataStyleStore.modelComponentTypeVisibility(modelId, "Corner");
  },
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVisibility(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const cornersColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelCornerColor(modelId, referenceCornerId.value) as RGBAColor | undefined,
  set: async (color) => {
    await dataStyleStore.setModelCornersColor(modelId, targetCornerIds, color);
    hybridViewerStore.remoteRender();
  },
});

const cornersActiveColoring = computed<string | undefined>({
  get: () =>
    dataStyleStore.modelCornerActiveColoring(modelId, referenceCornerId.value) as
      | string
      | undefined,
  set: async (coloringType) => {
    if (typeof coloringType !== "string") {
      return;
    }
    if (collections && coloringType === "random") {
      await Promise.all(
        collections.map((collection) =>
          dataStyleStore.setModelCornersActiveColoring(
            modelId,
            collection.children.map((child) => child.id),
            coloringType,
            collection.id,
          ),
        ),
      );
    } else {
      await dataStyleStore.setModelCornersActiveColoring(modelId, targetCornerIds, coloringType);
    }
    hybridViewerStore.remoteRender();
  },
});

// Group Attributes
const cornersVertexAttributeName = computed<AttributeName | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeName(modelId, referenceCornerId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeName(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornersVertexAttributeTimeStep = computed<number | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeTimeStep(modelId, referenceCornerId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeTimeStep(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornersVertexAttributeItem = computed<AttributeItem>({
  get: () => dataStyleStore.modelCornersVertexAttributeItem(modelId, referenceCornerId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeItem(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornersVertexAttributeRange = computed<AttributeRange>({
  get: () => dataStyleStore.modelCornersVertexAttributeRange(modelId, referenceCornerId.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeRange(
      modelId,
      targetCornerIds,
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const cornersVertexAttributeColorMap = computed<ColorMap | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeColorMap(modelId, referenceCornerId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeColorMap(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornersVertexAttributeNoDataColor = computed<RGBAColor>({
  get: () =>
    dataStyleStore.modelCornersVertexAttributeNoDataColor(modelId, referenceCornerId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeNoDataColor(
      modelId,
      targetCornerIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const { capabilities, schemas: attributeSchemas } = MODEL_VERTEX_COLORING;
</script>

<template>
  <div v-show="!activeTab || activeTab === 'type'" data-testid="modelComponentTypeOptions">
    <VisibilitySwitch data-testid="modelCornersVisibilitySwitch" v-model="cornersVisibility" />
    <ViewerOptionsColoringTypeSelector
      :data-id="modelId"
      :componentIds="targetCornerIds"
      v-model:coloring_style_key="cornersActiveColoring"
      v-model:color="cornersColor"
      v-model:vertex_attribute_name="cornersVertexAttributeName"
      v-model:vertex_attribute_item="cornersVertexAttributeItem"
      v-model:vertex_attribute_range="cornersVertexAttributeRange"
      v-model:vertex_attribute_color_map="cornersVertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="cornersVertexAttributeNoDataColor"
      v-model:vertex_attribute_time_step="cornersVertexAttributeTimeStep"
      :capabilities="capabilities"
      :schemas="attributeSchemas"
      :allowRandom="true"
    />
  </div>
</template>
