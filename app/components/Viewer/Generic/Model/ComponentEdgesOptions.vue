<script setup lang="ts">
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import ViewerOptionsWidthSlider from "@ogw_front/components/Viewer/Options/Sliders/Width.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface EdgesTarget {
  componentType: "Surface" | "Block";
  componentIds: string[];
}

interface Props {
  modelId: string;
  targets: EdgesTarget[];
  referenceComponentId?: string;
}

const { modelId, targets, referenceComponentId = undefined } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

// Each component type exposes its own edges functions in the data style store
const EDGES_STYLES = {
  Surface: {
    visibility: dataStyleStore.modelSurfaceEdgesVisibility,
    width: dataStyleStore.modelSurfaceEdgesWidth,
    color: dataStyleStore.modelSurfaceEdgesColor,
    activeColoring: dataStyleStore.modelSurfaceEdgesActiveColoring,
    vertexAttributeName: dataStyleStore.modelSurfaceEdgesVertexAttributeName,
    vertexAttributeItem: dataStyleStore.modelSurfaceEdgesVertexAttributeItem,
    vertexAttributeRange: dataStyleStore.modelSurfaceEdgesVertexAttributeRange,
    vertexAttributeColorMap: dataStyleStore.modelSurfaceEdgesVertexAttributeColorMap,
    vertexAttributeNoDataColor: dataStyleStore.modelSurfaceEdgesVertexAttributeNoDataColor,
    setVisibility: dataStyleStore.setModelSurfacesEdgesVisibility,
    setWidth: dataStyleStore.setModelSurfacesEdgesWidth,
    setColor: dataStyleStore.setModelSurfacesEdgesColor,
    setActiveColoring: dataStyleStore.setModelSurfacesEdgesActiveColoring,
    setVertexAttributeName: dataStyleStore.setModelSurfacesEdgesVertexAttributeName,
    setVertexAttributeItem: dataStyleStore.setModelSurfacesEdgesVertexAttributeItem,
    setVertexAttributeRange: dataStyleStore.setModelSurfacesEdgesVertexAttributeRange,
    setVertexAttributeColorMap: dataStyleStore.setModelSurfacesEdgesVertexAttributeColorMap,
    setVertexAttributeNoDataColor: dataStyleStore.setModelSurfacesEdgesVertexAttributeNoDataColor,
  },
  Block: {
    visibility: dataStyleStore.modelBlockEdgesVisibility,
    width: dataStyleStore.modelBlockEdgesWidth,
    color: dataStyleStore.modelBlockEdgesColor,
    activeColoring: dataStyleStore.modelBlockEdgesActiveColoring,
    vertexAttributeName: dataStyleStore.modelBlockEdgesVertexAttributeName,
    vertexAttributeItem: dataStyleStore.modelBlockEdgesVertexAttributeItem,
    vertexAttributeRange: dataStyleStore.modelBlockEdgesVertexAttributeRange,
    vertexAttributeColorMap: dataStyleStore.modelBlockEdgesVertexAttributeColorMap,
    vertexAttributeNoDataColor: dataStyleStore.modelBlockEdgesVertexAttributeNoDataColor,
    setVisibility: dataStyleStore.setModelBlocksEdgesVisibility,
    setWidth: dataStyleStore.setModelBlocksEdgesWidth,
    setColor: dataStyleStore.setModelBlocksEdgesColor,
    setActiveColoring: dataStyleStore.setModelBlocksEdgesActiveColoring,
    setVertexAttributeName: dataStyleStore.setModelBlocksEdgesVertexAttributeName,
    setVertexAttributeItem: dataStyleStore.setModelBlocksEdgesVertexAttributeItem,
    setVertexAttributeRange: dataStyleStore.setModelBlocksEdgesVertexAttributeRange,
    setVertexAttributeColorMap: dataStyleStore.setModelBlocksEdgesVertexAttributeColorMap,
    setVertexAttributeNoDataColor: dataStyleStore.setModelBlocksEdgesVertexAttributeNoDataColor,
  },
};
type EdgesStyle = (typeof EDGES_STYLES)[EdgesTarget["componentType"]];

// Values are read from the first target, changes are applied to every target
const edgesStyle = computed<EdgesStyle | undefined>(() => {
  const [reference] = targets;
  return reference === undefined ? undefined : EDGES_STYLES[reference.componentType];
});
const allComponentIds = computed<string[]>(() => targets.flatMap((target) => target.componentIds));

async function applyEdgesStyle(
  setter: (style: EdgesStyle, componentIds: string[]) => Promise<unknown>,
): Promise<void> {
  await Promise.all(
    targets.map(async (target) => {
      await setter(EDGES_STYLES[target.componentType], target.componentIds);
    }),
  );
  hybridViewerStore.remoteRender();
}

const visibility = computed<boolean | undefined>({
  get: () => edgesStyle.value?.visibility(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyEdgesStyle((style, ids) => style.setVisibility(modelId, ids, newValue));
  },
});

const width = computed<number | undefined>({
  get: () => edgesStyle.value?.width(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyEdgesStyle((style, ids) => style.setWidth(modelId, ids, newValue));
  },
});

const activeColoring = computed<string | undefined>({
  get: () => edgesStyle.value?.activeColoring(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyEdgesStyle((style, ids) => style.setActiveColoring(modelId, ids, newValue));
  },
});

const color = computed<RGBAColor | undefined>({
  get: () => edgesStyle.value?.color(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyEdgesStyle((style, ids) => style.setColor(modelId, ids, newValue));
  },
});

const vertexAttributeName = computed<string | undefined>({
  get: () => edgesStyle.value?.vertexAttributeName(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyEdgesStyle((style, ids) => style.setVertexAttributeName(modelId, ids, newValue));
  },
});

const vertexAttributeItem = computed<number | undefined>({
  get: () => edgesStyle.value?.vertexAttributeItem(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyEdgesStyle((style, ids) => style.setVertexAttributeItem(modelId, ids, newValue));
  },
});

const vertexAttributeRange = computed<(number | undefined)[] | undefined>({
  get: () => edgesStyle.value?.vertexAttributeRange(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyEdgesStyle((style, ids) =>
      style.setVertexAttributeRange(modelId, ids, minimum, maximum),
    );
  },
});

const vertexAttributeColorMap = computed<string | undefined>({
  get: () => edgesStyle.value?.vertexAttributeColorMap(modelId, referenceComponentId),
  set: async (newValue) => {
    await applyEdgesStyle((style, ids) => style.setVertexAttributeColorMap(modelId, ids, newValue));
  },
});

const vertexAttributeNoDataColor = computed<RGBAColor | undefined>({
  get: () => edgesStyle.value?.vertexAttributeNoDataColor(modelId, referenceComponentId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyEdgesStyle((style, ids) =>
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
  <div class="mt-2" data-testid="modelComponentEdgesOptions">
    <VisibilitySwitch data-testid="modelComponentEdgesVisibilitySwitch" v-model="visibility" />
    <template v-if="visibility">
      <ViewerOptionsWidthSlider data-testid="modelComponentEdgesWidthSlider" v-model="width" />
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
