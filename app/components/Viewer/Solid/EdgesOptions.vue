<script setup lang="ts">
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import SolidEdges from "@ogw_front/assets/viewer_svgs/solid_edges.svg";
import ViewerGenericMeshEdgesOptions from "@ogw_front/components/Viewer/Generic/Mesh/EdgesOptions";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshEdgesOptions
    :itemProps="itemProps"
    :btnImage="SolidEdges"
  />
</template>
