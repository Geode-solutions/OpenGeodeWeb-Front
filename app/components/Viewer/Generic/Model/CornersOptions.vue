<script setup lang="ts">
import type { CollectionComponent } from "@ogw_front/stores/data_helpers/collections";
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  modelId: string;
  cornerId?: string;
  targetCornerIds: string[];
  collections?: CollectionComponent[];
}

const {
  modelId,
  cornerId = undefined,
  targetCornerIds,
  collections = undefined,
} = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const referenceCornerId = computed<string | undefined>(() =>
  collections ? targetCornerIds[0] : undefined,
);

// Visibility
const cornersVisibility = computed<boolean>({
  get: () =>
    collections
      ? targetCornerIds.every((id) => dataStyleStore.modelCornerVisibility(modelId, id))
      : dataStyleStore.modelComponentTypeVisibility(modelId, "Corner"),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVisibility(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornerVisibility = computed<boolean | undefined>({
  get: () => dataStyleStore.modelCornerVisibility(modelId, cornerId) as boolean | undefined,
  set: async (newValue) => {
    if (cornerId === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVisibility(modelId, [cornerId], newValue);
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

// Group Attributes
const cornersVertexAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeName(modelId, referenceCornerId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeName(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornersVertexAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeItem(modelId, referenceCornerId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeItem(modelId, targetCornerIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const cornersVertexAttributeRange = computed<[number, number] | undefined>({
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

const cornersVertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelCornersVertexAttributeNoDataColor(modelId, referenceCornerId.value) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelCornersVertexAttributeNoDataColor(
      modelId,
      targetCornerIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelCornersVertexAttributeName(modelId, cornerId),
  set: async (newValue) => {
    if (cornerId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeName(modelId, [cornerId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeItem = computed<string | undefined>({
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

const vertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelCornersVertexAttributeNoDataColor(modelId, cornerId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    if (cornerId === undefined) {
      return;
    }
    await dataStyleStore.setModelCornersVertexAttributeNoDataColor(modelId, [cornerId], newValue);
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
  polyhedron: { available: false },
};

const vertexSchema = back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
</script>

<template>
  <OptionsSection title="Corners Options" class="mt-4" data-testid="modelComponentTypeOptions">
    <VisibilitySwitch data-testid="modelCornersVisibilitySwitch" v-model="cornersVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentIds="targetCornerIds"
      v-model:coloring_style_key="cornersActiveColoring"
      v-model:color="cornersColor"
      v-model:vertex_attribute_name="cornersVertexAttributeName"
      v-model:vertex_attribute_item="cornersVertexAttributeItem"
      v-model:vertex_attribute_range="cornersVertexAttributeRange"
      v-model:vertex_attribute_color_map="cornersVertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="cornersVertexAttributeNoDataColor"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema }"
      :allowRandom="true"
    />
  </OptionsSection>

  <OptionsSection
    v-if="cornerId"
    title="Component Options"
    class="mt-4"
    data-testid="modelComponentOptions"
  >
    <VisibilitySwitch v-model="cornerVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentIds="[cornerId]"
      v-model:coloring_style_key="cornerActiveColoring"
      v-model:color="cornerColor"
      v-model:vertex_attribute_name="vertexAttributeName"
      v-model:vertex_attribute_item="vertexAttributeItem"
      v-model:vertex_attribute_range="vertexAttributeRange"
      v-model:vertex_attribute_color_map="vertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="vertexAttributeNoDataColor"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema }"
      :allowRandom="true"
    />
  </OptionsSection>
</template>
