<template>
  <ViewerPointSetSpecificPointsOptions
    :itemProps="props.itemProps"
    :btn_image="PointSetPoints"
  />
</template>

<script setup>
  import ViewerPointSetSpecificPointsOptions from "./Viewer/PointSet/Specific/PointsOptions.vue"
  import PointSetPoints from "@ogw_f/assets/viewer_svgs/point_set_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
