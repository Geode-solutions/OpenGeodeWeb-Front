<script setup lang="ts">
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import SolidPoints from "@ogw_front/assets/viewer_svgs/solid_points.svg";
import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions.vue";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPointsOptions :itemProps="itemProps" :btnImage="SolidPoints" />
</template>
