<script setup lang="ts">
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import TriangulatedSurfaceEdgesPoints from "@ogw_front/assets/viewer_svgs/surface_points.svg";
import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions";

interface Props {
  itemProps: ItemProps & { index?: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerGenericMeshPointsOptions
    :itemProps="itemProps"
    :btnImage="TriangulatedSurfaceEdgesPoints"
  />
</template>
