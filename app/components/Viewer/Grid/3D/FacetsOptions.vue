<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="props.itemProps"
    :btn_image="Grid3D_Facets"
    tooltip="Facets options"
  />
</template>

<script setup>
  import ViewerGenericMeshPolygonsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsOptions.vue"
  import Grid3D_Facets from "@ogw_front/assets/viewer_svgs/grid_3d_facets.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
