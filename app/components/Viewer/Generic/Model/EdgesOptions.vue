<script setup lang="ts">
import type { MenuItemIndex } from "@ogw_front/types/ui";
import ModelEdgesCard from "./ModelEdgesCard.vue";
import type { ModelId } from "@ogw_front/types/identifiers";
import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";

interface Props {
  dataId: ModelId;
  index: MenuItemIndex;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerContextMenuItem
    data-testid="modelEdgesMenu"
    :index="index"
    tooltip="Edges options"
    :btnImage="SurfaceEdges"
  >
    <template #options>
      <ModelEdgesCard :data-id="dataId" />
    </template>
  </ViewerContextMenuItem>
</template>
