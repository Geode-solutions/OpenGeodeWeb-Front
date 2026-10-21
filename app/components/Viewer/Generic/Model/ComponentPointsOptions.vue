<script setup lang="ts">
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import ViewerOptionsSizeSlider from "@ogw_front/components/Viewer/Options/Sliders/Size.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface PointsTarget {
  componentType: "Surface" | "Line" | "Block";
  componentIds: string[];
}

interface Props {
  modelId: string;
  targets: PointsTarget[];
  referenceComponentId?: string;
}

const { modelId, targets, referenceComponentId = undefined } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

// Each component type exposes its own points functions in the data style store
const POINTS_STYLES = {
  Surface: {
    visibility: dataStyleStore.modelSurfacePointsVisibility,
    size: dataStyleStore.modelSurfacePointsSize,
    color: dataStyleStore.modelSurfacePointsColor,
    activeColoring: dataStyleStore.modelSurfacePointsActiveColoring,
    vertexAttributeName: dataStyleStore.modelSurfacePointsVertexAttributeName,
    vertexAttributeItem: dataStyleStore.modelSurfacePointsVertexAttributeItem,
    vertexAttributeRange: dataStyleStore.modelSurfacePointsVertexAttributeRange,
    vertexAttributeColorMap: dataStyleStore.modelSurfacePointsVertexAttributeColorMap,
    vertexAttributeNoDataColor: dataStyleStore.modelSurfacePointsVertexAttributeNoDataColor,
    setVisibility: dataStyleStore.setModelSurfacesPointsVisibility,
    setSize: dataStyleStore.setModelSurfacesPointsSize,
    setColor: dataStyleStore.setModelSurfacesPointsColor,
    setActiveColoring: dataStyleStore.setModelSurfacesPointsActiveColoring,
    setVertexAttributeName: dataStyleStore.setModelSurfacesPointsVertexAttributeName,
    setVertexAttributeItem: dataStyleStore.setModelSurfacesPointsVertexAttributeItem,
    setVertexAttributeRange: dataStyleStore.setModelSurfacesPointsVertexAttributeRange,
    setVertexAttributeColorMap: dataStyleStore.setModelSurfacesPointsVertexAttributeColorMap,
    setVertexAttributeNoDataColor: dataStyleStore.setModelSurfacesPointsVertexAttributeNoDataColor,
  },
  Line: {
    visibility: dataStyleStore.modelLinePointsVisibility,
    size: dataStyleStore.modelLinePointsSize,
    color: dataStyleStore.modelLinePointsColor,
    activeColoring: dataStyleStore.modelLinePointsActiveColoring,
    vertexAttributeName: dataStyleStore.modelLinePointsVertexAttributeName,
    vertexAttributeItem: dataStyleStore.modelLinePointsVertexAttributeItem,
    vertexAttributeRange: dataStyleStore.modelLinePointsVertexAttributeRange,
    vertexAttributeColorMap: dataStyleStore.modelLinePointsVertexAttributeColorMap,
    vertexAttributeNoDataColor: dataStyleStore.modelLinePointsVertexAttributeNoDataColor,
    setVisibility: dataStyleStore.setModelLinesPointsVisibility,
    setSize: dataStyleStore.setModelLinesPointsSize,
    setColor: dataStyleStore.setModelLinesPointsColor,
    setActiveColoring: dataStyleStore.setModelLinesPointsActiveColoring,
    setVertexAttributeName: dataStyleStore.setModelLinesPointsVertexAttributeName,
    setVertexAttributeItem: dataStyleStore.setModelLinesPointsVertexAttributeItem,
    setVertexAttributeRange: dataStyleStore.setModelLinesPointsVertexAttributeRange,
    setVertexAttributeColorMap: dataStyleStore.setModelLinesPointsVertexAttributeColorMap,
    setVertexAttributeNoDataColor: dataStyleStore.setModelLinesPointsVertexAttributeNoDataColor,
  },
  Block: {
    visibility: dataStyleStore.modelBlockPointsVisibility,
    size: dataStyleStore.modelBlockPointsSize,
    color: dataStyleStore.modelBlockPointsColor,
    activeColoring: dataStyleStore.modelBlockPointsActiveColoring,
    vertexAttributeName: dataStyleStore.modelBlockPointsVertexAttributeName,
    vertexAttributeItem: dataStyleStore.modelBlockPointsVertexAttributeItem,
    vertexAttributeRange: dataStyleStore.modelBlockPointsVertexAttributeRange,
    vertexAttributeColorMap: dataStyleStore.modelBlockPointsVertexAttributeColorMap,
    vertexAttributeNoDataColor: dataStyleStore.modelBlockPointsVertexAttributeNoDataColor,
    setVisibility: dataStyleStore.setModelBlocksPointsVisibility,
    setSize: dataStyleStore.setModelBlocksPointsSize,
    setColor: dataStyleStore.setModelBlocksPointsColor,
    setActiveColoring: dataStyleStore.setModelBlocksPointsActiveColoring,
    setVertexAttributeName: dataStyleStore.setModelBlocksPointsVertexAttributeName,
    setVertexAttributeItem: dataStyleStore.setModelBlocksPointsVertexAttributeItem,
    setVertexAttributeRange: dataStyleStore.setModelBlocksPointsVertexAttributeRange,
    setVertexAttributeColorMap: dataStyleStore.setModelBlocksPointsVertexAttributeColorMap,
    setVertexAttributeNoDataColor: dataStyleStore.setModelBlocksPointsVertexAttributeNoDataColor,
  },
};
type PointsStyle = (typeof POINTS_STYLES)[PointsTarget["componentType"]];

// Values are read from the first target, changes are applied to every target
const pointsStyle = computed<PointsStyle | undefined>(() => {
  const [reference] = targets;
  return reference === undefined ? undefined : POINTS_STYLES[reference.componentType];
});
const allComponentIds = computed<string[]>(() => targets.flatMap((target) => target.componentIds));

async function applyPointsStyle(
  setter: (style: PointsStyle, componentIds: string[]) => Promise<unknown>,
): Promise<void> {
  await Promise.all(
    targets.map(async (target) => {
      await setter(POINTS_STYLES[target.componentType], target.componentIds);
    }),
  );
  hybridViewerStore.remoteRender();
}

const visibility = computed<boolean | undefined>({
  get: () => pointsStyle.value?.visibility(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyPointsStyle((style, ids) => style.setVisibility(modelId, ids, newValue));
  },
});

const size = computed<number | undefined>({
  get: () => pointsStyle.value?.size(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyPointsStyle((style, ids) => style.setSize(modelId, ids, newValue));
  },
});

const activeColoring = computed<string | undefined>({
  get: () => pointsStyle.value?.activeColoring(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyPointsStyle((style, ids) => style.setActiveColoring(modelId, ids, newValue));
  },
});

const color = computed<RGBAColor | undefined>({
  get: () => pointsStyle.value?.color(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyPointsStyle((style, ids) => style.setColor(modelId, ids, newValue));
  },
});

const vertexAttributeName = computed<string | undefined>({
  get: () => pointsStyle.value?.vertexAttributeName(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyPointsStyle((style, ids) => style.setVertexAttributeName(modelId, ids, newValue));
  },
});

const vertexAttributeItem = computed<number | undefined>({
  get: () => pointsStyle.value?.vertexAttributeItem(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyPointsStyle((style, ids) => style.setVertexAttributeItem(modelId, ids, newValue));
  },
});

const vertexAttributeRange = computed<(number | undefined)[] | undefined>({
  get: () => pointsStyle.value?.vertexAttributeRange(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyPointsStyle((style, ids) =>
      style.setVertexAttributeRange(modelId, ids, minimum, maximum),
    );
  },
});

const vertexAttributeColorMap = computed<string | undefined>({
  get: () => pointsStyle.value?.vertexAttributeColorMap(modelId, referenceComponentId),
  set: async (newValue) => {
    await applyPointsStyle((style, ids) =>
      style.setVertexAttributeColorMap(modelId, ids, newValue),
    );
  },
});

const vertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () => pointsStyle.value?.vertexAttributeNoDataColor(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyPointsStyle((style, ids) =>
      style.setVertexAttributeNoDataColor(modelId, ids, newValue),
    );
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

const backSchemas = back_schemas.opengeodeweb_back;
const attributeSchemas = {
  vertex: {
    names: backSchemas.model_component_vertex_attribute_names,
    range: backSchemas.model_component_vertex_attribute_range,
  },
};
</script>

<template>
  <div class="mt-2" data-testid="modelComponentPointsOptions">
    <VisibilitySwitch data-testid="modelComponentPointsVisibilitySwitch" v-model="visibility" />
    <template v-if="visibility">
      <ViewerOptionsSizeSlider data-testid="modelComponentPointsSizeSlider" v-model="size" />
      <ViewerOptionsColoringTypeSelector
        :id="modelId"
        :componentIds="allComponentIds"
        v-model:coloring_style_key="activeColoring"
        v-model:color="color"
        v-model:vertex_attribute_name="vertexAttributeName"
        v-model:vertex_attribute_item="vertexAttributeItem"
        v-model:vertex_attribute_range="vertexAttributeRange"
        v-model:vertex_attribute_color_map="vertexAttributeColorMap"
        v-model:vertex_attribute_no_data_color="vertexAttributeNoDataColor"
        :capabilities="capabilities"
        :schemas="attributeSchemas"
      />
    </template>
  </div>
</template>
