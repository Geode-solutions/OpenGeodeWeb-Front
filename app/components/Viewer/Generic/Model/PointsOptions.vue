<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ModelPointsCard from "./ModelPointsCard.vue";
import SurfacePoints from "@ogw_front/assets/viewer_svgs/surface_points.svg";

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();
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
      <ModelPointsCard :itemProps="itemProps" />
    </template>
  </ViewerContextMenuItem>
</template>
