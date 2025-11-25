<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="Grid3D_Edges"
  />
</template>

<script setup>
  import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions.vue"
  import Grid3D_Edges from "@ogw_front/assets/viewer_svgs/grid_3d_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
