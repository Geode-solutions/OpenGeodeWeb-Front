<template>
  <ViewerGenericMeshPolyhedraOptions
    :itemProps="props.itemProps"
    :btn_image="Grid3DCells"
    tooltip="Cells options"
  />
</template>

<script setup>
  import Grid3DCells from "@ogw_f/assets/viewer_svgs/grid_3d_cells.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
