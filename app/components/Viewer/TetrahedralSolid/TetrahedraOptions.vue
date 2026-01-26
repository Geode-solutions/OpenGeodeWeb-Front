<template>
  <ViewerGenericMeshPolyhedraOptions
    :itemProps="props.itemProps"
    :btn_image="TetrahedralSolidTetrahedra"
    tooltip="Tetrahedra options"
  />
</template>

<script setup>
  import ViewerGenericMeshPolyhedraOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolyhedraOptions"
  import TetrahedralSolidTetrahedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
    index: { type: Number, required: true },
  })
</script>
