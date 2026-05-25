<script setup>
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const dataStore = useDataStore();

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const modelId = computed(() => itemProps.meta_data.modelId || itemProps.id);
const componentId = computed(() => itemProps.meta_data.pickedComponentId);
const selection = dataStyleStore.visibleMeshComponents(modelId.value);
const componentType = ref(undefined);

watchEffect(async () => {
  if (itemProps.meta_data.viewer_type === "model_component_type") {
    componentType.value = itemProps.meta_data.modelComponentType;
  } else if (componentId.value && modelId.value) {
    componentType.value = await dataStore.meshComponentType(modelId.value, componentId.value);
  } else {
    componentType.value = undefined;
  }
});

const targetComponentIds = ref([]);
watchEffect(async () => {
  targetComponentIds.value = [];
  if (componentType.value && modelId.value) {
    const activeType = componentType.value;
    const ids = await dataStore.getMeshComponentGeodeIds(
      modelId.value,
      activeType,
    );
    if (componentType.value === activeType) {
      targetComponentIds.value = ids;
    }
  }
});

const modelVisibility = computed({
  get: () => dataStyleStore.modelVisibility(modelId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelVisibility(modelId.value, newValue);
    hybridViewerStore.remoteRender();
  },
});

const modelComponentTypeVisibility = computed({
  get: () => selection.value.includes(componentType.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentTypeVisibility(
      modelId.value,
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const componentVisibility = computed({
  get: () => selection.value.includes(componentId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsVisibility(modelId.value, [componentId.value], newValue);
    hybridViewerStore.remoteRender();
  },
});

const componentColor = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.getModelComponentEffectiveColor(
          modelId.value,
          componentId.value,
          componentType.value,
        )
      : undefined,
  set: async (color) => {
    if (componentId.value) {
      await dataStyleStore.setModelComponentsColor(modelId.value, [componentId.value], color);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColor = computed({
  get: () =>
    componentType.value
      ? dataStyleStore.getModelComponentTypeColor(modelId.value, componentType.value)
      : undefined,
  set: async (color) => {
    if (componentType.value) {
      await dataStyleStore.setModelComponentTypeColor(modelId.value, componentType.value, color);
      hybridViewerStore.remoteRender();
    }
  },
});

const modelComponentTypeColorMode = computed({
  get: () => dataStyleStore.getModelComponentTypeColorMode(modelId.value, componentType.value),
  set: async (colorMode) => {
    if (componentType.value) {
      await dataStyleStore.setModelComponentTypeColorMode(
        modelId.value,
        componentType.value,
        colorMode,
      );
      hybridViewerStore.remoteRender();
    }
  },
});

const componentColorMode = computed({
  get: () => dataStyleStore.getModelComponentColorMode(modelId.value, componentId.value),
  set: async (colorMode) => {
    if (componentId.value) {
      await dataStyleStore.setModelComponentColorMode(modelId.value, componentId.value, colorMode);
      hybridViewerStore.remoteRender();
    }
  },
});

const colorModes = [
  { title: "Constant", value: "constant" },
  { title: "Random", value: "random" },
];

const modelComponentTypeLabel = computed(() =>
  componentType.value ? `${componentType.value}s Options` : "",
);

const modelComponentsColorMode = ref("constant");

const modelComponentsColor = computed({
  get: () => {
    if (selection.value.length > 0) {
      return dataStyleStore.getModelComponentColor(modelId.value, selection.value[0]);
    }
    return { red: 255, green: 255, blue: 255 };
  },
  set: async (color) => {
    if (selection.value.length > 0) {
      await dataStyleStore.setModelComponentsColor(
        modelId.value,
        selection.value,
        color,
        modelComponentsColorMode.value,
      );
      hybridViewerStore.remoteRender();
    }
  },
});

watch(modelComponentsColorMode, async (colorMode) => {
  if (colorMode === "random" && selection.value.length > 0) {
    await dataStyleStore.setModelComponentsColor(
      modelId.value,
      selection.value,
      undefined,
      colorMode,
    );
    hybridViewerStore.remoteRender();
  }
});

const capabilities = computed(() => {
  const cap = {
    color: { available: true },
    textures: { available: false },
    vertex: { available: false },
    edge: { available: false },
    cell: { available: false },
    polygon: { available: false },
    polyhedron: { available: false },
  };
  const type = componentType.value;
  if (!type) return cap;

  cap.vertex.available = true;
  if (type === "Line") {
    cap.edge.available = true;
  } else if (type === "Surface") {
    cap.polygon.available = true;
  } else if (type === "Block") {
    cap.polyhedron.available = true;
  }
  return cap;
});

const vertexSchema = computed(() => {
  return back_schemas.opengeodeweb_back.model_component_vertex_attribute_names;
});

const edgeSchema = computed(() => {
  return back_schemas.opengeodeweb_back.model_component_edge_attribute_names;
});

const polygonSchema = computed(() => {
  return back_schemas.opengeodeweb_back.model_component_polygon_attribute_names;
});

const polyhedronSchema = computed(() => {
  return back_schemas.opengeodeweb_back.model_component_polyhedron_attribute_names;
});

const typeVertexAttrName = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeName(
          modelId.value,
          targetComponentIds.value[0],
          "vertex",
        )
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeName(
      modelId.value,
      targetComponentIds.value,
      "vertex",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typeVertexAttrRange = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeRange(
          modelId.value,
          targetComponentIds.value[0],
          "vertex",
        )
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeRange(
      modelId.value,
      targetComponentIds.value,
      "vertex",
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const typeVertexAttrColorMap = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeColorMap(
          modelId.value,
          targetComponentIds.value[0],
          "vertex",
        )
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeColorMap(
      modelId.value,
      targetComponentIds.value,
      "vertex",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const typeEdgeAttrName = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeName(
          modelId.value,
          targetComponentIds.value[0],
          "edge",
        )
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeName(
      modelId.value,
      targetComponentIds.value,
      "edge",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typeEdgeAttrRange = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeRange(
          modelId.value,
          targetComponentIds.value[0],
          "edge",
        )
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeRange(
      modelId.value,
      targetComponentIds.value,
      "edge",
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const typeEdgeAttrColorMap = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeColorMap(
          modelId.value,
          targetComponentIds.value[0],
          "edge",
        )
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeColorMap(
      modelId.value,
      targetComponentIds.value,
      "edge",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const typePolygonAttrName = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeName(
          modelId.value,
          targetComponentIds.value[0],
          "polygon",
        )
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeName(
      modelId.value,
      targetComponentIds.value,
      "polygon",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolygonAttrRange = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeRange(
          modelId.value,
          targetComponentIds.value[0],
          "polygon",
        )
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeRange(
      modelId.value,
      targetComponentIds.value,
      "polygon",
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolygonAttrColorMap = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeColorMap(
          modelId.value,
          targetComponentIds.value[0],
          "polygon",
        )
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeColorMap(
      modelId.value,
      targetComponentIds.value,
      "polygon",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const typePolyhedronAttrName = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeName(
          modelId.value,
          targetComponentIds.value[0],
          "polyhedron",
        )
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeName(
      modelId.value,
      targetComponentIds.value,
      "polyhedron",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolyhedronAttrRange = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeRange(
          modelId.value,
          targetComponentIds.value[0],
          "polyhedron",
        )
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeRange(
      modelId.value,
      targetComponentIds.value,
      "polyhedron",
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const typePolyhedronAttrColorMap = computed({
  get: () =>
    targetComponentIds.value.length > 0
      ? dataStyleStore.modelComponentAttributeColorMap(
          modelId.value,
          targetComponentIds.value[0],
          "polyhedron",
        )
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeColorMap(
      modelId.value,
      targetComponentIds.value,
      "polyhedron",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

// Attribute computeds for individual styling
const compVertexAttrName = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeName(modelId.value, componentId.value, "vertex")
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeName(
      modelId.value,
      [componentId.value],
      "vertex",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compVertexAttrRange = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeRange(modelId.value, componentId.value, "vertex")
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeRange(
      modelId.value,
      [componentId.value],
      "vertex",
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const compVertexAttrColorMap = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeColorMap(modelId.value, componentId.value, "vertex")
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeColorMap(
      modelId.value,
      [componentId.value],
      "vertex",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const compEdgeAttrName = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeName(modelId.value, componentId.value, "edge")
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeName(
      modelId.value,
      [componentId.value],
      "edge",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compEdgeAttrRange = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeRange(modelId.value, componentId.value, "edge")
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeRange(
      modelId.value,
      [componentId.value],
      "edge",
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const compEdgeAttrColorMap = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeColorMap(modelId.value, componentId.value, "edge")
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeColorMap(
      modelId.value,
      [componentId.value],
      "edge",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const compPolygonAttrName = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeName(modelId.value, componentId.value, "polygon")
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeName(
      modelId.value,
      [componentId.value],
      "polygon",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolygonAttrRange = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeRange(modelId.value, componentId.value, "polygon")
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeRange(
      modelId.value,
      [componentId.value],
      "polygon",
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolygonAttrColorMap = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeColorMap(modelId.value, componentId.value, "polygon")
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeColorMap(
      modelId.value,
      [componentId.value],
      "polygon",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});

const compPolyhedronAttrName = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeName(modelId.value, componentId.value, "polyhedron")
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeName(
      modelId.value,
      [componentId.value],
      "polyhedron",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolyhedronAttrRange = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeRange(modelId.value, componentId.value, "polyhedron")
      : [undefined, undefined],
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeRange(
      modelId.value,
      [componentId.value],
      "polyhedron",
      componentType.value,
      newValue[0],
      newValue[1],
    );
    hybridViewerStore.remoteRender();
  },
});
const compPolyhedronAttrColorMap = computed({
  get: () =>
    componentId.value
      ? dataStyleStore.modelComponentAttributeColorMap(
          modelId.value,
          componentId.value,
          "polyhedron",
        )
      : undefined,
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsAttributeColorMap(
      modelId.value,
      [componentId.value],
      "polyhedron",
      componentType.value,
      newValue,
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <v-sheet class="model-style-card" color="transparent">
    <OptionsSection title="Model Options">
      <VisibilitySwitch v-model="modelVisibility" />
    </OptionsSection>

    <OptionsSection v-if="!componentType && !componentId" title="Components Options" class="mt-6">
      <v-label class="text-caption mb-1 mt-2">Color Mode</v-label>
      <v-select
        v-model="modelComponentsColorMode"
        :items="colorModes"
        density="compact"
        hide-details
        class="mb-3"
        variant="outlined"
      />

      <template v-if="modelComponentsColorMode === 'constant'">
        <v-label class="text-caption mb-1">Color</v-label>
        <ViewerOptionsColorPicker v-model="modelComponentsColor" />
      </template>
    </OptionsSection>

    <OptionsSection v-if="componentType" :title="modelComponentTypeLabel" class="mt-6">
      <VisibilitySwitch v-model="modelComponentTypeVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="targetComponentIds[0]"
            v-model:coloring_style_key="modelComponentTypeColorMode"
            v-model:color="modelComponentTypeColor"
            v-model:vertex_attribute_name="typeVertexAttrName"
            v-model:vertex_attribute_range="typeVertexAttrRange"
            v-model:vertex_attribute_color_map="typeVertexAttrColorMap"
            v-model:edge_attribute_name="typeEdgeAttrName"
            v-model:edge_attribute_range="typeEdgeAttrRange"
            v-model:edge_attribute_color_map="typeEdgeAttrColorMap"
            v-model:polygon_attribute_name="typePolygonAttrName"
            v-model:polygon_attribute_range="typePolygonAttrRange"
            v-model:polygon_attribute_color_map="typePolygonAttrColorMap"
            v-model:polyhedron_attribute_name="typePolyhedronAttrName"
            v-model:polyhedron_attribute_range="typePolyhedronAttrRange"
            v-model:polyhedron_attribute_color_map="typePolyhedronAttrColorMap"
            :capabilities="capabilities"
            :vertexSchema="vertexSchema"
            :edgeSchema="edgeSchema"
            :polygonSchema="polygonSchema"
            :polyhedronSchema="polyhedronSchema"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>

    <OptionsSection v-if="componentId" title="Component Options" class="mt-6">
      <VisibilitySwitch v-model="componentVisibility" />
      <v-row class="mt-2 pa-0">
        <v-col class="pa-0">
          <ViewerOptionsColoringTypeSelector
            :id="modelId"
            :componentId="componentId"
            v-model:coloring_style_key="componentColorMode"
            v-model:color="componentColor"
            v-model:vertex_attribute_name="compVertexAttrName"
            v-model:vertex_attribute_range="compVertexAttrRange"
            v-model:vertex_attribute_color_map="compVertexAttrColorMap"
            v-model:edge_attribute_name="compEdgeAttrName"
            v-model:edge_attribute_range="compEdgeAttrRange"
            v-model:edge_attribute_color_map="compEdgeAttrColorMap"
            v-model:polygon_attribute_name="compPolygonAttrName"
            v-model:polygon_attribute_range="compPolygonAttrRange"
            v-model:polygon_attribute_color_map="compPolygonAttrColorMap"
            v-model:polyhedron_attribute_name="compPolyhedronAttrName"
            v-model:polyhedron_attribute_range="compPolyhedronAttrRange"
            v-model:polyhedron_attribute_color_map="compPolyhedronAttrColorMap"
            :capabilities="capabilities"
            :vertexSchema="vertexSchema"
            :edgeSchema="edgeSchema"
            :polygonSchema="polygonSchema"
            :polyhedronSchema="polyhedronSchema"
            :allowRandom="true"
          />
        </v-col>
      </v-row>
    </OptionsSection>
  </v-sheet>
</template>

<style scoped>
.model-style-card {
  padding-top: 20px;
  overflow-x: hidden;
}
</style>
