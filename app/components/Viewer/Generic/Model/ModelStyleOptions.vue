<script setup>
import ModelColor from "@ogw_front/assets/viewer_svgs/model_component_color.svg";
import ModelStyleCard from "./ModelStyleCard.vue";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem";

const { itemProps } = defineProps({
  itemProps: { type: Object, required: true },
});
</script>

<template>
  <ViewerContextMenuItem
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Style options"
    :btn_image="ModelColor"
  >
    <template #options>
      <ModelStyleCard :itemProps="itemProps" />
    </template>
  </ViewerContextMenuItem>
</template>
