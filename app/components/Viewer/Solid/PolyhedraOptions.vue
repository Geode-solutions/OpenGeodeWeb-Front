<template>
  <ViewerGenericMeshPolyhedraOptions
    :itemProps="props.itemProps"
    :btn_image="SolidPolyhedra"
  />
</template>

<script setup>
  import ViewerGenericMeshPolyhedraOptions from "./GenericMeshPolyhedraOptions.vue"
  import SolidPolyhedra from "@ogw_f/assets/viewer_svgs/solid_polyhedra.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
