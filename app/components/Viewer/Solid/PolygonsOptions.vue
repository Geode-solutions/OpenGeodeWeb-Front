<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import SolidFacets from "@ogw_front/assets/viewer_svgs/solid_facets.svg";
import ViewerGenericMeshPolygonsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsOptions.vue";

interface Props {
  dataId: DataId;
  index: number;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPolygonsOptions
    :data-id="dataId"
    :index="index"
    :btnImage="SolidFacets"
    :capabilities="{ textures: { available: false } }"
  />
</template>
