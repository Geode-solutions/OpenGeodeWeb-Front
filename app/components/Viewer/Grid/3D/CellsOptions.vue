<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import Grid3DCells from "@ogw_front/assets/viewer_svgs/grid_3d_cells.svg";
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
    :btnImage="Grid3DCells"
    tooltip="Cells options"
  />
</template>
