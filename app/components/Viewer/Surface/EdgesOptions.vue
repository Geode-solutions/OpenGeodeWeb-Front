<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { MenuItemIndex } from "@ogw_front/types/ui";
import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg";
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
    :btnImage="SurfaceEdges"
    :capabilities="{ edge: { available: false } }"
  />
</template>
