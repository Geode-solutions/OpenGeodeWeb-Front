<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import ViewerSpecificPolygonsOptions from "@ogw_front/components/Viewer/Surface/PolygonsOptions.vue";

interface Props {
  dataId: DataId;
  index: number;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerSpecificPolygonsOptions :data-id="dataId" :index="index" tooltip="Triangles options" />
</template>
