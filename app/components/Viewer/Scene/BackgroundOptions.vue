<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();

const backgroundColor = computed<ColorRGBA>({
  get: () => dataStyleStore.sceneStyle.background_color,
  set: async (color) => {
    await dataStyleStore.setSceneBackgroundColor(color);
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="sceneBackgroundMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Background"
    btnIcon="ph-image"
  >
    <template #options>
      <ViewerOptionsColorPicker v-model="backgroundColor" disabled-alpha />
    </template>
  </ViewerContextMenuItem>
</template>
