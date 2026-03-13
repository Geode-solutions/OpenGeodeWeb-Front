<script setup>
  import Grid3D_Edges from "@ogw_front/assets/viewer_svgs/grid_3d_edges.svg"
  import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="itemProps"
    :btn_image="Grid3D_Edges"
  />
</template>
