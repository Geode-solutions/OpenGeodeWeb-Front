<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="PolygonalSurfaceEdges"
  />
</template>

<script setup>
import PolygonalSurfaceEdges from "@ogw_f/assets/viewer_svgs/surface_edges.svg";

const props = defineProps({
  itemProps: { type: Object, required: true },
});
</script>
