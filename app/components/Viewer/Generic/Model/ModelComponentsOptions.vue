<script setup>
import ModelColor from "@ogw_front/assets/viewer_svgs/model_component_color.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";

import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const { index, itemProps, isSubItem } = defineProps({
  index: { type: Number, required: true },
  itemProps: { type: Object, required: true },
  isSubItem: { type: Boolean, default: false },
});

const modelId = computed(() => itemProps.meta_data.modelId || itemProps.id);
const componentId = computed(() => itemProps.meta_data.pickedComponentId);

const color = computed({
  get: () => dataStyleStore.getModelComponentColor(modelId.value, componentId.value),
  set: async (newValue) => {
    await dataStyleStore.setModelComponentsColor(modelId.value, [componentId.value], newValue);
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    :index="index"
    :itemProps="itemProps"
    tooltip="Components color"
    :btn_image="ModelColor"
    :is-sub-item="isSubItem"
  >
    <template #options>
      <v-row class="pa-0" align="center">
        <v-col>
          <ViewerOptionsColorPicker v-model="color" />
        </v-col>
      </v-row>
    </template>
  </ViewerContextMenuItem>
</template>
