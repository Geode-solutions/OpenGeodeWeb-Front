<script setup>
  import Grid3D_Points from "@ogw_front/assets/viewer_svgs/grid_3d_points.svg"
  import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="itemProps"
    :btn_image="Grid3D_Points"
  />
</template>
