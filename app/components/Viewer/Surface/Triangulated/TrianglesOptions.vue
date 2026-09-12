<script setup lang="ts">
import ViewerSpecificPolygonsOptions from "@ogw_front/components/Viewer/Surface/PolygonsOptions.vue";

// oxlint-disable-next-line vue/define-props-declaration
const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});
</script>

<template>
  <ViewerSpecificPolygonsOptions :itemProps="itemProps" tooltip="Triangles options" />
</template>
