<script setup>
import ModelComponentsOptions from "@ogw_front/components/Viewer/Generic/Model/ModelComponentsOptions";
import SurfaceTriangles from "@ogw_front/assets/viewer_svgs/surface_triangles.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem";

const RADIUS_OFFSET = 60;

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const subItemProps = computed(() => {
  const angle = (itemProps.index / itemProps.totalItems) * 2 * Math.PI;
  return {
    ...itemProps,
    isSubItem: true,
    style: {
      transform: `translate(${Math.cos(angle) * RADIUS_OFFSET}px, ${Math.sin(angle) * RADIUS_OFFSET}px)`,
    },
  };
});
</script>

<template>
  <ViewerContextMenuItem
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Style options"
    :btn_image="SurfaceTriangles"
    no-card
  >
    <template #options>
      <ModelComponentsOptions
        :index="0"
        :itemProps="subItemProps"
        is-sub-item
        :style="subItemProps.style"
      />
    </template>
  </ViewerContextMenuItem>
</template>
