<script setup>
import ModelColor from "@ogw_front/assets/viewer_svgs/model_component_color.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";

import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const modelId = computed(() => itemProps.meta_data.modelId);
const componentId = computed(() => itemProps.id);

const color = computed({
  get: () => dataStyleStore.getModelComponentColor(modelId.value, componentId.value),
  set: async (newValue) => {
    await dataStyleStore.setComponentsColor(modelId.value, [componentId.value], newValue);
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem :itemProps="itemProps" tooltip="Components color" :btn_image="ModelColor">
    <template #options>
      <v-row class="pa-0" align="center">
        <v-col>
          <ViewerOptionsColorPicker v-model="color" />
        </v-col>
      </v-row>
    </template>
  </ViewerContextMenuItem>
</template>
