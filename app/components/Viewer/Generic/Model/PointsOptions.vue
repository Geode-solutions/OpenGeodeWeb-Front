<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import ModelPointsCard from "./ModelPointsCard.vue";
import SurfacePoints from "@ogw_front/assets/viewer_svgs/surface_points.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";

interface Props {
  dataId: DataId;
  index: number;
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
