<script setup lang="ts">
import type { Opacity, Visibility } from "@geode/opengeodeweb-viewer/schema_types";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { ImageId } from "@ogw_front/types/identifiers";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerOptionsOpacitySlider from "@ogw_front/components/Viewer/Options/Sliders/Opacity.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  dataId: DataId;
  index: number;
}

const { dataId, index } = defineProps<Props>();

const visibility = computed<Visibility | undefined>({
  get: () => dataStyleStore.imageVisibility(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (imageId: ImageId) =>
      dataStyleStore.setImageVisibility(imageId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const opacity = computed<Opacity | undefined>({
  get: () => dataStyleStore.imageOpacity(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (imageId: ImageId) =>
      dataStyleStore.setImageOpacity(imageId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="imageMenu"
    :index="index"
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
