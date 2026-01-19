<template>
  <ViewerSpecificPolyhedraOptions
    :itemProps="props.itemProps"
    :btn_image="SolidPolyhedras"
    :index="props.index"
  />
</template>

<script setup>
  import ViewerSpecificPolyhedraOptions from "@ogw_front/components/Viewer/Solid/SpecificPolyhedraOptions"
  import SolidPolyhedras from "@ogw_front/assets/viewer_svgs/solid_polyhedras.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
    index: { type: Number, required: true },
  })
</script>
