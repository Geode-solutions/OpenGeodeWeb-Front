<script setup>
  import Grid3D_Facets from "@ogw_front/assets/viewer_svgs/grid_3d_facets.svg"
  import ViewerGenericMeshPolygonsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="itemProps"
    :btn_image="Grid3D_Facets"
    tooltip="Facets options"
  />
</template>
