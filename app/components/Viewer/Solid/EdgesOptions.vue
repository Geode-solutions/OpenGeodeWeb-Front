<script setup>
  import SolidEdges from "@ogw_front/assets/viewer_svgs/solid_edges.svg"
  import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="itemProps"
    :btn_image="SolidEdges"
  />
</template>
