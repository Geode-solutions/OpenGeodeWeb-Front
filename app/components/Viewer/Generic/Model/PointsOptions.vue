<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import SurfacePoints from "@ogw_front/assets/viewer_svgs/surface_points.svg";
import ViewerOptionsSizeSlider from "@ogw_front/components/Viewer/Options/Sliders/Size.vue";
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

const id = computed<string>(
  () => (itemProps.meta_data.modelId as string | undefined) || itemProps.id,
);

const visibility = computed<boolean>({
  get: () => dataStyleStore.modelPointsVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setModelPointsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const size = computed<number>({
  get: () => dataStyleStore.modelPointsSize(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setModelPointsSize(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="modelPointsMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Points options"
    :btnImage="SurfacePoints"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="modelPointsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsSizeSlider
          data-testid="modelPointsSizeSlider"
          v-model="size"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
