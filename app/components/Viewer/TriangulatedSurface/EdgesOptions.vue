<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="SurfaceEdges"
  />
</template>

<script setup>
  import ViewerGenericMeshEdgesOptions from "./GenericMeshEdgesOptions.vue"
  import SurfaceEdges from "@ogw_f/assets/viewer_svgs/surface_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
