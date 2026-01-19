<template>
  <ViewerPointSetSpecificPointsOptions
    :itemProps="props.itemProps"
    :btn_image="PointSetPoints"
    :index="props.index"
  />
</template>

<script setup>
  import ViewerPointSetSpecificPointsOptions from "@ogw_front/components/Viewer/PointSet/SpecificPointsOptions"
  import PointSetPoints from "@ogw_front/assets/viewer_svgs/point_set_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
    index: { type: Number, required: true },
  })
</script>
