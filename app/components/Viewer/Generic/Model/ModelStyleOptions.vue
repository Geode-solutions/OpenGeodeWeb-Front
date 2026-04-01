<script setup>
import ModelComponentsOptions from "@ogw_front/components/Viewer/Generic/Model/ModelComponentsOptions";
import SurfaceTriangles from "@ogw_front/assets/viewer_svgs/surface_triangles.svg";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem";

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});

const subItemProps = computed(() => ({
  ...itemProps,
  isSubItem: true,
}));
</script>

<template>
  <ViewerContextMenuItem
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Components options"
    :btn_image="SurfaceTriangles"
    no-card
  >
    <template #options>
      <ModelComponentsOptions
        :index="0"
        :itemProps="subItemProps"
        is-sub-item
        style="position: relative !important"
      />
    </template>
  </ViewerContextMenuItem>
</template>
