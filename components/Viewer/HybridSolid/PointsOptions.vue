<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="props.itemProps"
    :btn_image="HybridSolidPoints"
  />
</template>

<script setup>
  import HybridSolidPoints from "@ogw_f/assets/viewer_svgs/solid_points.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
