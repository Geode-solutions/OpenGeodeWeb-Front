<script setup lang="ts">
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import TetrahedralSolidTriangles from "@ogw_front/assets/viewer_svgs/solid_facets.svg";
import ViewerGenericMeshPolygonsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsOptions";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="itemProps"
    :btnImage="TetrahedralSolidTriangles"
    tooltip="Triangles options"
  />
</template>
