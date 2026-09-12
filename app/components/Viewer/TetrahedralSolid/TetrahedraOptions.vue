<script setup lang="ts">
import TetrahedralSolidTetrahedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg";
import ViewerGenericMeshPolyhedraOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolyhedraOptions.vue";

// oxlint-disable-next-line vue/define-props-declaration
const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});
</script>

<template>
  <ViewerGenericMeshPolyhedraOptions
    :itemProps="itemProps"
    :btnImage="TetrahedralSolidTetrahedra"
    tooltip="Tetrahedra options"
  />
</template>
