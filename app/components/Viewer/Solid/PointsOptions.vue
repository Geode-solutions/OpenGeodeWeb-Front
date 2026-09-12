<script setup lang="ts">
import SolidPoints from "@ogw_front/assets/viewer_svgs/solid_points.svg";
import ViewerGenericMeshPointsOptions from "@ogw_front/components/Viewer/Generic/Mesh/PointsOptions.vue";

// oxlint-disable-next-line vue/define-props-declaration
const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});
</script>

<template>
  <ViewerGenericMeshPointsOptions :itemProps="itemProps" :btnImage="SolidPoints" />
</template>
