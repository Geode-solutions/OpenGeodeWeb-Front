<script setup>
  import TetrahedralSolidTetrahedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg"
  import ViewerGenericMeshPolyhedraOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolyhedraOptions"

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>

<template>
  <ViewerGenericMeshPolyhedraOptions
    :itemProps="itemProps"
    :btn_image="TetrahedralSolidTetrahedra"
    tooltip="Tetrahedra options"
  />
</template>
