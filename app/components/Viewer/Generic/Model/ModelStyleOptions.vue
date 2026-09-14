<script setup lang="ts">
import ModelColor from "@ogw_front/assets/viewer_svgs/model_component_color.svg";
import ModelStyleCard from "./ModelStyleCard.vue";
// oxlint-disable-next-line import/consistent-type-specifier-style -- combining the default import with the type import avoids a duplicate-imports violation on this same module
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";

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
