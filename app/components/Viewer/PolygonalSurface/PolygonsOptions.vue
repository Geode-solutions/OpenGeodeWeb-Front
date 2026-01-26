<template>
  <ViewerSpecificPolygonsOptions
    :itemProps="props.itemProps"
    :btn_image="PolygonalSurfacePolygons"
  />
</template>

<script setup>
  import ViewerSpecificPolygonsOptions from "@ogw_front/components/Viewer/PolygonalSurface/SpecificPolygonsOptions"
  import PolygonalSurfacePolygons from "@ogw_front/assets/viewer_svgs/surface_triangles.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
    index: { type: Number, required: true },
  })
</script>
