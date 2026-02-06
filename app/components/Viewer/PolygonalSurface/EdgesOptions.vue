<script setup>
  import PolygonalSurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg"
  import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="itemProps"
    :btn_image="PolygonalSurfaceEdges"
  />
</template>
