<script setup lang="ts">
import Grid3D_Points from "@ogw_front/assets/viewer_svgs/grid_3d_points.svg";
import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions.vue";

// oxlint-disable-next-line vue/define-props-declaration
const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});
</script>

<template>
  <ViewerGenericMeshPointsOptions :itemProps="itemProps" :btnImage="Grid3D_Points" />
</template>
