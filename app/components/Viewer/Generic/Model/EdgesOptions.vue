<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import ModelEdgesCard from "./ModelEdgesCard.vue";
import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";

interface Props {
  dataId: DataId;
  index: number;
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
