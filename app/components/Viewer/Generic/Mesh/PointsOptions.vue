<script setup>
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector";
import ViewerOptionsSizeSlider from "@ogw_front/components/Viewer/Options/Sliders/Size";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch";

import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const { itemProps, btn_image, tooltip } = defineProps({
  itemProps: { type: Object, required: true },
  btn_image: { type: String, required: true },
  tooltip: { type: String, required: false, default: "Points options" },
});

const id = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshPointsVisibility(id.value),
  set: async (newValue) => {
    await dataStyleStore.setMeshPointsVisibility(id.value, newValue);
    hybridViewerStore.remoteRender();
  },
});
const size = computed({
  get: () => dataStyleStore.meshPointsSize(id.value),
  set: async (newValue) => {
    await dataStyleStore.setMeshPointsSize(id.value, newValue);
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshPointsActiveColoring(id.value),
  set: async (newValue) => {
    await dataStyleStore.setMeshPointsActiveColoring(id.value, newValue);
    hybridViewerStore.remoteRender();
  },
});
const color = computed({
  get: () => dataStyleStore.meshPointsColor(id.value),
  set: async (newValue) => {
    await dataStyleStore.setMeshPointsColor(id.value, newValue);
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeName(id.value),
  set: async (newValue) => {
    await dataStyleStore.setMeshPointsVertexAttributeName(id.value, newValue);
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeRange(id.value),
  set: async (newValue) => {
    await dataStyleStore.setMeshPointsVertexAttributeRange(id.value, newValue[0], newValue[1]);
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeColorMap(id.value),
  set: async (newValue) => {
    await dataStyleStore.setMeshPointsVertexAttributeColorMap(id.value, newValue);
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshPointsMenu"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btn_image="btn_image"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPointsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-row class="pa-0" align="center">
          <v-divider />
          <ViewerOptionsSizeSlider data-testid="meshPointsSizeSlider" v-model="size" />
        </v-row>
        <v-row>
          <v-col>
            <ViewerOptionsColoringTypeSelector
              :id="id"
              v-model:coloring_style_key="coloring_style_key"
              v-model:color="color"
              v-model:vertex_attribute_name="vertex_attribute_name"
              v-model:vertex_attribute_range="vertex_attribute_range"
              v-model:vertex_attribute_color_map="vertex_attribute_color_map"
              :capabilities="{ vertex: { available: false } }"
            />
          </v-col>
        </v-row>
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
