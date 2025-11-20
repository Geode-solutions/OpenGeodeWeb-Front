<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="PolygonalSurfacePoints"
  />
</template>

<script setup>
  import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions.vue"
  import PolygonalSurfacePoints from "@ogw_front/assets/viewer_svgs/surface_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
