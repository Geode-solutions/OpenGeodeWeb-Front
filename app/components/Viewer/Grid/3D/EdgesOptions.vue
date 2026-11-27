<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import Grid3D_Edges from "@ogw_front/assets/viewer_svgs/grid_3d_edges.svg";
import type { MenuItemIndex } from "@ogw_front/types/ui";
import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions.vue";

interface Props {
  dataId: DataId;
  index: MenuItemIndex;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshEdgesOptions
    :data-id="dataId"
    :index="index"
    :btnImage="Grid3D_Edges"
    :capabilities="{ edge: { available: false } }"
  />
</template>
