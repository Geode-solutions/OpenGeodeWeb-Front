<script setup>
  import SolidPoints from "@ogw_front/assets/viewer_svgs/solid_points.svg"
  import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="itemProps"
    :btn_image="SolidPoints"
  />
</template>
