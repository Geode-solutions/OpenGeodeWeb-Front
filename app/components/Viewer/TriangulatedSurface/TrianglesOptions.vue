<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="props.itemProps"
    :btn_image="TriangulatedSurfaceEdgesTriangles"
    tooltip="Triangles options"
  />
</template>

<script setup>
  import ViewerGenericMeshPolygonsOptions from "./GenericMeshPolygonsOptions.vue"
  import TriangulatedSurfaceEdgesTriangles from "@ogw_f/assets/viewer_svgs/surface_triangles.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
