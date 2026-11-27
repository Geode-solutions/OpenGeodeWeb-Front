<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import Grid2D_Cells from "@ogw_front/assets/viewer_svgs/grid_2d_cells.svg";
import type { MenuItemIndex } from "@ogw_front/types/ui";
import ViewerGenericMeshCellsOptions from "@ogw_front/components/Viewer/Generic/Mesh/CellsOptions.vue";

interface Props {
  dataId: DataId;
  index: MenuItemIndex;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshCellsOptions
    :data-id="dataId"
    :index="index"
    :btnImage="Grid2D_Cells"
    tooltip="Cells options"
  />
</template>
