<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="PolygonalSurfaceEdges"
  />
</template>

<script setup>
  import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions.vue"
  import PolygonalSurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
