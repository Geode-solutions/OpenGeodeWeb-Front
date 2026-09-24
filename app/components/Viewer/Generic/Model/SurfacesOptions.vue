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
  surfaceId?: string;
  targetSurfaceIds: string[];
  isCollection?: boolean;
}

const { modelId, surfaceId = undefined, targetSurfaceIds, isCollection } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const referenceSurfaceId = computed<string | undefined>(() =>
  isCollection ? targetSurfaceIds[0] : undefined,
);

// Visibility
const surfacesVisibility = computed<boolean>({
  get: () =>
    isCollection
      ? targetSurfaceIds.every((id) => dataStyleStore.modelSurfaceVisibility(modelId, id))
      : dataStyleStore.modelComponentTypeVisibility(modelId, "Surface"),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVisibility(modelId, targetSurfaceIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const surfaceVisibility = computed<boolean>({
  get: () => dataStyleStore.modelSurfaceVisibility(modelId, surfaceId) as boolean | undefined,
  set: async (newValue) => {
    if (surfaceId === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesVisibility(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

// Color
const surfacesColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelSurfaceColor(modelId, referenceSurfaceId.value) as RGBAColor | undefined,
  set: async (color) => {
    await dataStyleStore.setModelSurfacesColor(modelId, targetSurfaceIds, color);
    hybridViewerStore.remoteRender();
  },
});

const surfaceColor = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.modelSurfaceColor(modelId, surfaceId) as RGBAColor | undefined,
  set: async (color) => {
    if (surfaceId === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesColor(modelId, [surfaceId], color);
    hybridViewerStore.remoteRender();
  },
});

const surfacesActiveColoring = computed<string | undefined>({
  get: () =>
    dataStyleStore.modelSurfaceActiveColoring(modelId, referenceSurfaceId.value) as
      | string
      | undefined,
  set: async (coloringType) => {
    if (typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelSurfacesActiveColoring(modelId, targetSurfaceIds, coloringType);
    hybridViewerStore.remoteRender();
  },
});

const surfaceActiveColoring = computed<string | undefined>({
  get: () => dataStyleStore.modelSurfaceActiveColoring(modelId, surfaceId) as string | undefined,
  set: async (coloringType) => {
    if (surfaceId === undefined || typeof coloringType !== "string") {
      return;
    }
    await dataStyleStore.setModelSurfacesActiveColoring(modelId, [surfaceId], coloringType);
    hybridViewerStore.remoteRender();
  },
});

// Group Attributes
const surfacesVertexAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelSurfacesVertexAttributeName(modelId, referenceSurfaceId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesVertexAttributeName(modelId, targetSurfaceIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const surfacesVertexAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelSurfacesVertexAttributeItem(modelId, referenceSurfaceId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeItem(modelId, targetSurfaceIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const surfacesVertexAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelSurfacesVertexAttributeRange(modelId, referenceSurfaceId.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesVertexAttributeRange(
      modelId,
      targetSurfaceIds,
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const surfacesVertexAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelSurfacesVertexAttributeColorMap(modelId, referenceSurfaceId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeColorMap(
      modelId,
      targetSurfaceIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const surfacesVertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelSurfacesVertexAttributeNoDataColor(modelId, referenceSurfaceId.value) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesVertexAttributeNoDataColor(
      modelId,
      targetSurfaceIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const surfacesPolygonAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeName(modelId, referenceSurfaceId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesPolygonAttributeName(modelId, targetSurfaceIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const surfacesPolygonAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeItem(modelId, referenceSurfaceId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeItem(modelId, targetSurfaceIds, newValue);
    hybridViewerStore.remoteRender();
  },
});

const surfacesPolygonAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeRange(modelId, referenceSurfaceId.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesPolygonAttributeRange(
      modelId,
      targetSurfaceIds,
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const surfacesPolygonAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () =>
    dataStyleStore.modelSurfacesPolygonAttributeColorMap(modelId, referenceSurfaceId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeColorMap(
      modelId,
      targetSurfaceIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const surfacesPolygonAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelSurfacesPolygonAttributeNoDataColor(modelId, referenceSurfaceId.value) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelSurfacesPolygonAttributeNoDataColor(
      modelId,
      targetSurfaceIds,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

// Individual Attributes
const vertexAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelSurfacesVertexAttributeName(modelId, surfaceId),
  set: async (newValue) => {
    if (surfaceId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesVertexAttributeName(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelSurfacesVertexAttributeItem(modelId, surfaceId),
  set: async (newValue) => {
    if (surfaceId === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesVertexAttributeItem(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelSurfacesVertexAttributeRange(modelId, surfaceId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (surfaceId === undefined || minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesVertexAttributeRange(
      modelId,
      [surfaceId],
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelSurfacesVertexAttributeColorMap(modelId, surfaceId),
  set: async (newValue) => {
    if (surfaceId === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesVertexAttributeColorMap(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const vertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelSurfacesVertexAttributeNoDataColor(modelId, surfaceId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    if (surfaceId === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesVertexAttributeNoDataColor(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeName = computed<string | undefined>({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeName(modelId, surfaceId),
  set: async (newValue) => {
    if (surfaceId === undefined || newValue === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesPolygonAttributeName(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeItem = computed<string | undefined>({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeItem(modelId, surfaceId),
  set: async (newValue) => {
    if (surfaceId === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesPolygonAttributeItem(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeRange = computed<[number, number] | undefined>({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeRange(modelId, surfaceId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (surfaceId === undefined || minimum === undefined || maximum === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesPolygonAttributeRange(
      modelId,
      [surfaceId],
      minimum,
      maximum,
    );
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeColorMap = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.modelSurfacesPolygonAttributeColorMap(modelId, surfaceId),
  set: async (newValue) => {
    if (surfaceId === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesPolygonAttributeColorMap(modelId, [surfaceId], newValue);
    hybridViewerStore.remoteRender();
  },
});

const polygonAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.modelSurfacesPolygonAttributeNoDataColor(modelId, surfaceId) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    if (surfaceId === undefined) {
      return;
    }
    await dataStyleStore.setModelSurfacesPolygonAttributeNoDataColor(
      modelId,
      [surfaceId],
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
  polygon: { available: true },
  polyhedron: { available: false },
};

const vertexSchema = back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
const polygonSchema = back_schemas.opengeodeweb_back.model_component_polygon_attribute_names;
</script>

<template>
  <OptionsSection title="Surfaces Options" class="mt-4" data-testid="modelComponentTypeOptions">
    <VisibilitySwitch data-testid="modelSurfacesVisibilitySwitch" v-model="surfacesVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentIds="targetSurfaceIds"
      v-model:coloring_style_key="surfacesActiveColoring"
      v-model:color="surfacesColor"
      v-model:vertex_attribute_name="surfacesVertexAttributeName"
      v-model:vertex_attribute_item="surfacesVertexAttributeItem"
      v-model:vertex_attribute_range="surfacesVertexAttributeRange"
      v-model:vertex_attribute_color_map="surfacesVertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="surfacesVertexAttributeNoDataColor"
      v-model:polygon_attribute_name="surfacesPolygonAttributeName"
      v-model:polygon_attribute_item="surfacesPolygonAttributeItem"
      v-model:polygon_attribute_range="surfacesPolygonAttributeRange"
      v-model:polygon_attribute_color_map="surfacesPolygonAttributeColorMap"
      v-model:polygon_attribute_no_data_color="surfacesPolygonAttributeNoDataColor"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema, polygon: polygonSchema }"
      :allowRandom="true"
    />
  </OptionsSection>

  <OptionsSection
    v-if="surfaceId"
    title="Component Options"
    class="mt-4"
    data-testid="modelComponentOptions"
  >
    <VisibilitySwitch v-model="surfaceVisibility" />
    <ViewerOptionsColoringTypeSelector
      :id="modelId"
      :componentIds="[surfaceId]"
      v-model:coloring_style_key="surfaceActiveColoring"
      v-model:color="surfaceColor"
      v-model:vertex_attribute_name="vertexAttributeName"
      v-model:vertex_attribute_item="vertexAttributeItem"
      v-model:vertex_attribute_range="vertexAttributeRange"
      v-model:vertex_attribute_color_map="vertexAttributeColorMap"
      v-model:vertex_attribute_no_data_color="vertexAttributeNoDataColor"
      v-model:polygon_attribute_name="polygonAttributeName"
      v-model:polygon_attribute_item="polygonAttributeItem"
      v-model:polygon_attribute_range="polygonAttributeRange"
      v-model:polygon_attribute_color_map="polygonAttributeColorMap"
      v-model:polygon_attribute_no_data_color="polygonAttributeNoDataColor"
      :capabilities="capabilities"
      :schemas="{ vertex: vertexSchema, polygon: polygonSchema }"
      :allowRandom="true"
    />
  </OptionsSection>
</template>
