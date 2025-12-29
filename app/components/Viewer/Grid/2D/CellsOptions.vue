<template>
  <ViewerGenericMeshCellsOptions
    :itemProps="props.itemProps"
    :btn_image="Grid2D_Cells"
    tooltip="Cells options"
  />
</template>

<script setup>
  import ViewerGenericMeshCellsOptions from "@ogw_front/components/Viewer/Generic/Mesh/CellsOptions"
  import Grid2D_Cells from "@ogw_front/assets/viewer_svgs/grid_2d_cells.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
