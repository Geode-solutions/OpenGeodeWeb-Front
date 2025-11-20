<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="HybridSolidEdges"
  />
</template>

<script setup>
  import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions.vue"
  import HybridSolidEdges from "@ogw_front/assets/viewer_svgs/solid_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
