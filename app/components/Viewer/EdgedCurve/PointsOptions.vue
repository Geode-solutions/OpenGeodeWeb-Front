<script setup>
  import EdgedCurvePoints from "@ogw_front/assets/viewer_svgs/edged_curve_points.svg"
  import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="itemProps"
    :btn_image="EdgedCurvePoints"
  />
</template>
