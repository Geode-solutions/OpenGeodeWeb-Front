<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="TriangulatedSurfaceEdgesPoints"
  />
</template>

<script setup>
  import TriangulatedSurfaceEdgesPoints from "@ogw_f/assets/viewer_svgs/surface_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
