<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ModelColor from "@ogw_front/assets/viewer_svgs/model_component_color.svg";
import ModelStyleCard from "./ModelStyleCard.vue";

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();
</script>

<template>
  <ViewerContextMenuItem
    data-testid="modelStyleMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    tooltip="Style options"
    :btnImage="ModelColor"
  >
    <template #options>
      <ModelStyleCard :itemProps="itemProps" />
    </template>
  </ViewerContextMenuItem>
</template>
