<script setup lang="ts">
import type { MenuItemIndex } from "@ogw_front/types/ui";
import type { ModelId } from "@ogw_front/types/identifiers";
import ModelPointsCard from "./ModelPointsCard.vue";
import SurfacePoints from "@ogw_front/assets/viewer_svgs/surface_points.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";

interface Props {
  dataId: ModelId;
  index: MenuItemIndex;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerContextMenuItem
    data-testid="modelPointsMenu"
    :index="index"
    tooltip="Points options"
    :btnImage="SurfacePoints"
  >
    <template #options>
      <ModelPointsCard :data-id="dataId" />
    </template>
  </ViewerContextMenuItem>
</template>
