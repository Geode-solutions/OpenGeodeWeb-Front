<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="SolidPoints"
  />
</template>

<script setup>
  import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions.vue"
  import SolidPoints from "@ogw_front/assets/viewer_svgs/solid_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
