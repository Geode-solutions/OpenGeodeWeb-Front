<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="props.itemProps"
    :btn_image="SolidFacets"
  />
</template>

<script setup>
  import ViewerGenericMeshPolygonsOptions from "./GenericMeshPolygonsOptions.vue"
  import SolidFacets from "@ogw_f/assets/viewer_svgs/solid_facets.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
