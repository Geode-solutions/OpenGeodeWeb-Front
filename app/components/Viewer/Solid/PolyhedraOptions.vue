<template>
  <ViewerGenericMeshPolyhedraOptions
    :itemProps="props.itemProps"
    :btn_image="SolidPolyhedra"
  />
</template>

<script setup>
  import ViewerGenericMeshPolyhedraOptions from "@ogw_front/components/Viewer/Generic/Mesh/PolyhedraOptions.vue"
  import SolidPolyhedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
