<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import Grid3D_Edges from "@ogw_front/assets/viewer_svgs/grid_3d_edges.svg";
import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions.vue";

interface Props {
  dataId: DataId;
  index: number;
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
