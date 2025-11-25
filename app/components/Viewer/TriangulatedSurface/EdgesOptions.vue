<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="SurfaceEdges"
  />
</template>

<script setup>
  import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions.vue"
  import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
