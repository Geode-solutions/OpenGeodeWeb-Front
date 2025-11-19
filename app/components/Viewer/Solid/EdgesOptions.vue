<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="SolidEdges"
  />
</template>

<script setup>
  import ViewerGenericMeshEdgesOptions from "../Generic/Mesh/EdgesOptions.vue"
  import SolidEdges from "@ogw_f/assets/viewer_svgs/solid_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
