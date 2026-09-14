<script setup lang="ts">
import Grid2D_Cells from "@ogw_front/assets/viewer_svgs/grid_2d_cells.svg";
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import ViewerGenericMeshCellsOptions from "@ogw_front/components/Viewer/Generic/Mesh/CellsOptions";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshCellsOptions
    :itemProps="itemProps"
    :btnImage="Grid2D_Cells"
    tooltip="Cells options"
  />
</template>
