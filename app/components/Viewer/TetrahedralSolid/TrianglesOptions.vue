<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="props.itemProps"
    :btn_image="TetrahedralSolidTriangles"
    tooltip="Triangles options"
  />
</template>

<script setup>
  import ViewerGenericMeshPolygonsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsOptions"
  import TetrahedralSolidTriangles from "@ogw_front/assets/viewer_svgs/solid_facets.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
    index: { type: Number, required: true },
  })
</script>
