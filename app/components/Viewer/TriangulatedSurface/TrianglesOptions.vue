<script setup>
  import TriangulatedSurfaceTriangles from "@ogw_front/assets/viewer_svgs/surface_triangles.svg"
  import ViewerSpecificPolygonsOptions from "@ogw_front/components/Viewer/PolygonalSurface/SpecificPolygonsOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerSpecificPolygonsOptions
    :itemProps="itemProps"
    :btn_image="TriangulatedSurfaceTriangles"
    tooltip="Triangles options"
  />
</template>
