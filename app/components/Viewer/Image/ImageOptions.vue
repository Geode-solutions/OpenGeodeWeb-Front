<script setup lang="ts">
import type { Opacity, Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import type { ImageId } from "@ogw_front/types/identifiers";
import ViewerOptionsOpacitySlider from "@ogw_front/components/Viewer/Options/Sliders/Opacity.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();

const dataId = toRef(() => itemProps.id);

const visibility = computed<Visibility | undefined>({
  get: () => dataStyleStore.imageVisibility(dataId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId.value, (imageId: ImageId) =>
      dataStyleStore.setImageVisibility(imageId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const opacity = computed<Opacity | undefined>({
  get: () => dataStyleStore.imageOpacity(dataId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId.value, (imageId: ImageId) =>
      dataStyleStore.setImageOpacity(imageId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="imageMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Image options"
    btnIcon="ph-image"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch data-testid="imageVisibilitySwitch" v-model="visibility" />
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsOpacitySlider data-testid="imageOpacitySlider" v-model="opacity" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
