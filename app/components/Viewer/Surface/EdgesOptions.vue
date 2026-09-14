<script setup lang="ts">
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg";
import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions.vue";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshEdgesOptions :itemProps="itemProps" :btnImage="SurfaceEdges" />
</template>
