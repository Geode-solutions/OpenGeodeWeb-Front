<template>
  <ViewerSpecificPolyhedraOptions
    :itemProps="props.itemProps"
    :btn_image="SolidPolyhedra"
  />
</template>

<script setup>
  import ViewerSpecificPolyhedraOptions from "@ogw_front/components/Viewer/Solid/SpecificPolyhedraOptions"
  import SolidPolyhedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })
</script>
