<script setup>
  import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions"
  import TriangulatedSurfaceEdgesPoints from "@ogw_front/assets/viewer_svgs/surface_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="TriangulatedSurfaceEdgesPoints"
  />
</template>
