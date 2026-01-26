<template>
  <ViewerSpecificEdgesOptions
    :itemProps="props.itemProps"
    :btn_image="EdgedCurveEdges"
  />
</template>

<script setup>
  import ViewerSpecificEdgesOptions from "@ogw_front/components/Viewer/EdgedCurve/SpecificEdgesOptions"
  import EdgedCurveEdges from "@ogw_front/assets/viewer_svgs/edged_curve_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
