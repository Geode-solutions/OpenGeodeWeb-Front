<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import TetrahedralSolidTetrahedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg";
import ViewerGenericMeshPolyhedraOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolyhedraOptions.vue";

interface Props {
  dataId: DataId;
  index: number;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPolyhedraOptions
    :data-id="dataId"
    :index="index"
    :btnImage="TetrahedralSolidTetrahedra"
    tooltip="Tetrahedra options"
  />
</template>
