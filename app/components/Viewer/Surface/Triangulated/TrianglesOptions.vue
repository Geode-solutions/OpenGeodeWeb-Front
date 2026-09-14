<script setup lang="ts">
import type { ItemProps } from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerSpecificPolygonsOptions from "@ogw_front/components/Viewer/Surface/PolygonsOptions.vue";

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerSpecificPolygonsOptions :itemProps="itemProps" tooltip="Triangles options" />
</template>
