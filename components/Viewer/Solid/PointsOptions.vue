<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="SolidPoints"
  />
</template>

<script setup>
  import SolidPoints from "@ogw_f/assets/viewer_svgs/solid_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
