<script setup lang="ts">
import Grid3D_Edges from "@ogw_front/assets/viewer_svgs/grid_3d_edges.svg";
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="itemProps"
    :btnImage="Grid3D_Edges"
  />
</template>
