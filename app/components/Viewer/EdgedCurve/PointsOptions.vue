<script setup lang="ts">
import EdgedCurvePoints from "@ogw_front/assets/viewer_svgs/edged_curve_points.svg";
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions.vue";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="itemProps"
    :btnImage="EdgedCurvePoints"
  />
</template>
