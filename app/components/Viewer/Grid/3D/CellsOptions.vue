<script setup lang="ts">
import Grid3DCells from "@ogw_front/assets/viewer_svgs/grid_3d_cells.svg";
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshCellsOptions from "@ogw_front/components/Viewer/Generic/Mesh/CellsOptions.vue";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshCellsOptions
    :itemProps="itemProps"
    :btnImage="Grid3DCells"
    tooltip="Cells options"
  />
</template>
