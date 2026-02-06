<script setup>
  import Grid3DCells from "@ogw_front/assets/viewer_svgs/grid_3d_cells.svg"
  import ViewerGenericMeshCellsOptions from "@ogw_front/components/Viewer/Generic/Mesh/CellsOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshCellsOptions
    :itemProps="itemProps"
    :btn_image="Grid3DCells"
    tooltip="Cells options"
  />
</template>
