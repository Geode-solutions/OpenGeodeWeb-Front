<script setup lang="ts">
import Grid3D_Facets from "@ogw_front/assets/viewer_svgs/grid_3d_facets.svg";
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshPolygonsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsOptions.vue";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="itemProps"
    :btnImage="Grid3D_Facets"
    tooltip="Facets options"
  />
</template>
