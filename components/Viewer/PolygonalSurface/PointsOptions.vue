<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="PolygonalSurfacePoints"
  />
</template>

<script setup>
  import PolygonalSurfacePoints from "@ogw_f/assets/viewer_svgs/surface_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
