<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="props.itemProps"
    :btn_image="HybridSolidPolygons"
  />
</template>

<script setup>
  import HybridSolidPolygons from "@ogw_f/assets/viewer_svgs/solid_facets.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
