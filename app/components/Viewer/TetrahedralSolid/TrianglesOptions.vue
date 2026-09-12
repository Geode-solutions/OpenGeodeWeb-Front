<script setup lang="ts">
import TetrahedralSolidTriangles from "@ogw_front/assets/viewer_svgs/solid_facets.svg";
import ViewerGenericMeshPolygonsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsOptions.vue";

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});
</script>

<template>
  <ViewerGenericMeshPolygonsOptions
    :itemProps="itemProps"
    :btnImage="TetrahedralSolidTriangles"
    tooltip="Triangles options"
  />
</template>
