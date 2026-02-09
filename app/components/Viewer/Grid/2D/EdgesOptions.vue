<script setup>
  import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions"
  import Grid2D_Edges from "@ogw_front/assets/viewer_svgs/grid_2d_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="Grid2D_Edges"
  />
</template>
