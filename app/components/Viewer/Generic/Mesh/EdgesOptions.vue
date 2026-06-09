<script setup>
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch";
import ViewerOptionsWidthSlider from "@ogw_front/components/Viewer/Options/Sliders/Width";

import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const { itemProps, btn_image, tooltip } = defineProps({
  itemProps: { type: Object, required: true },
  btn_image: { type: String, required: true },
  tooltip: { type: String, required: false, default: "Edges options" },
});

const id = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshEdgesVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const size = computed({
  get: () => dataStyleStore.meshEdgesWidth(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesWidth(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshEdgesActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed({
  get: () => dataStyleStore.meshEdgesColor(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId) =>
      dataStyleStore.setMeshEdgesColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshEdgesMenu"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btn_image="btn_image"
  >
    <template #options>
      <v-row>
        <v-col>
          <ViewerOptionsVisibilitySwitch
            data-testid="meshEdgesVisibilitySwitch"
            v-model="visibility"
          />
        </v-col>
      </v-row>
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsWidthSlider data-testid="meshEdgesWidthSlider" v-model="size" />
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
