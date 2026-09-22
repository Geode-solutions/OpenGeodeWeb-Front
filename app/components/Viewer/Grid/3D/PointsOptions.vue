<script setup lang="ts">
import Grid3D_Points from "@ogw_front/assets/viewer_svgs/grid_3d_points.svg";
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions.vue";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPointsOptions :itemProps="itemProps" :btnImage="Grid3D_Points" />
</template>
