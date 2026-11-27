<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import Grid3D_Facets from "@ogw_front/assets/viewer_svgs/grid_3d_facets.svg";
import type { MenuItemIndex } from "@ogw_front/types/ui";
import ViewerGenericMeshPolygonsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsOptions.vue";

interface Props {
  dataId: DataId;
  index: MenuItemIndex;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPolygonsOptions
    :data-id="dataId"
    :index="index"
    :btnImage="Grid3D_Facets"
    tooltip="Facets options"
  />
</template>
