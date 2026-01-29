<script setup>
  import ViewerSpecificPolygonsOptions from "@ogw_front/components/Viewer/PolygonalSurface/SpecificPolygonsOptions"
  import TriangulatedSurfaceTriangles from "@ogw_front/assets/viewer_svgs/surface_triangles.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerSpecificPolygonsOptions
    :itemProps="props.itemProps"
    :btn_image="TriangulatedSurfaceTriangles"
    tooltip="Triangles options"
  />
</template>
