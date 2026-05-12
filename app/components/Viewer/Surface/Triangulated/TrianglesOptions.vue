<script setup>
import ViewerSpecificPolygonsOptions from "@ogw_front/components/Viewer/Surface/PolygonsOptions";

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});
</script>

<template>
  <ViewerSpecificPolygonsOptions :itemProps="itemProps" tooltip="Triangles options" />
</template>
