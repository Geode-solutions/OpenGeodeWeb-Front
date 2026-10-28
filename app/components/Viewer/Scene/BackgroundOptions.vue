<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import SceneBackground from "@ogw_front/assets/viewer_svgs/scene_background.svg";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();

const dataStyleStore = useDataStyleStore();

const backgroundColor = computed<RGBAColor>({
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
    :btnImage="SceneBackground"
  >
    <template #options>
      <ViewerOptionsColorPicker v-model="backgroundColor" disabled-alpha />
    </template>
  </ViewerContextMenuItem>
</template>
