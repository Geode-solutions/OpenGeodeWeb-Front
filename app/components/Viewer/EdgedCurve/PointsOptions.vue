<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="EdgedCurvePoints"
  />
</template>

<script setup>
  import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions"
  import EdgedCurvePoints from "@ogw_front/assets/viewer_svgs/edged_curve_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
