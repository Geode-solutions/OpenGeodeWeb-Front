<script setup>
import Grid2D_Points from "@ogw_front/assets/viewer_svgs/grid_2d_points.svg";
import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions";

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});
</script>

<template>
  <ViewerGenericMeshPointsOptions :itemProps="itemProps" :btnImage="Grid2D_Points" />
</template>
