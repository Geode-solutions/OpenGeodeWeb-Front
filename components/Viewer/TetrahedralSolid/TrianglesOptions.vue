<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="props.itemProps"
    :btn_image="TetrahedralSolidTriangles"
    tooltip="Triangles options"
  />
</template>

<script setup>
  import TetrahedralSolidTriangles from "@ogw_f/assets/viewer_svgs/solid_facets.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
