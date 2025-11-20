<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="props.itemProps"
    :btn_image="TriangulatedSurfaceEdgesTriangles"
    tooltip="Triangles options"
  />
</template>

<script setup>
  import ViewerGenericMeshPolygonsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsOptions.vue"
  import TriangulatedSurfaceEdgesTriangles from "@ogw_front/assets/viewer_svgs/surface_triangles.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
