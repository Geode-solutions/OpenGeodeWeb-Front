<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="EdgedCurvePoints"
  />
</template>

<script setup>
  import EdgedCurvePoints from "@ogw_f/assets/viewer_svgs/edged_curve_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
