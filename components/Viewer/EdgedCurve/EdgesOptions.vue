<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="EdgedCurveEdges"
  />
</template>

<script setup>
  import EdgedCurveEdges from "@ogw_f/assets/viewer_svgs/edged_curve_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
