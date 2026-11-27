<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import Grid3D_Points from "@ogw_front/assets/viewer_svgs/grid_3d_points.svg";
import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions.vue";

interface Props {
  dataId: DataId;
  index: number;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPointsOptions :data-id="dataId" :index="index" :btnImage="Grid3D_Points" />
</template>
