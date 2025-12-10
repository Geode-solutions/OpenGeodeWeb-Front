<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="Grid2D_Points"
  />
</template>

<script setup>
  import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions"
  import Grid2D_Points from "@ogw_front/assets/viewer_svgs/grid_2d_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
