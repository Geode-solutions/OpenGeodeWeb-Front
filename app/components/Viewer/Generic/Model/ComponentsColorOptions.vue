<script setup>
import ModelColor from "@ogw_front/assets/viewer_svgs/surface_polygons.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";

import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const id = computed(() => itemProps.id);
const components_selection = dataStyleStore.visibleMeshComponents(id);

const color = ref({ r: 255, g: 255, b: 255 });

watch(color, async (newValue) => {
  if (components_selection.value.length > 0) {
    await dataStyleStore.setComponentsColor(id.value, components_selection.value, newValue);
    hybridViewerStore.remoteRender();
  }
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
