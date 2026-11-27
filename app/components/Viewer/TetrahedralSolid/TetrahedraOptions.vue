<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { MenuItemIndex } from "@ogw_front/types/ui";
import TetrahedralSolidTetrahedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg";
import ViewerGenericMeshPolyhedraOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolyhedraOptions.vue";

interface Props {
  dataId: DataId;
  index: MenuItemIndex;
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
