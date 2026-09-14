<script setup lang="ts">
import Grid2D_Edges from "@ogw_front/assets/viewer_svgs/grid_2d_edges.svg";
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions.vue";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshEdgesOptions :itemProps="itemProps" :btnImage="Grid2D_Edges" />
</template>
