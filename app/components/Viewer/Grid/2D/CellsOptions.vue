<script setup>
  import Grid2D_Cells from "@ogw_front/assets/viewer_svgs/grid_2d_cells.svg"
  import ViewerGenericMeshCellsOptions from "@ogw_front/components/Viewer/Generic/Mesh/CellsOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshCellsOptions
    :itemProps="itemProps"
    :btn_image="Grid2D_Cells"
    tooltip="Cells options"
  />
</template>
