<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import EdgedCurvePoints from "@ogw_front/assets/viewer_svgs/edged_curve_points.svg";
import type { MenuItemIndex } from "@ogw_front/types/ui";
import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions.vue";

interface Props {
  dataId: DataId;
  index: MenuItemIndex;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPointsOptions :data-id="dataId" :index="index" :btnImage="EdgedCurvePoints" />
</template>
