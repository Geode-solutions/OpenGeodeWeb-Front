<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import ModelColor from "@ogw_front/assets/viewer_svgs/model_component_color.svg";
import ModelStyleCard from "./ModelStyleCard.vue";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";

interface Props {
  dataId: DataId;
  index: number;
}

const { dataId, index } = defineProps<Props>();
</script>

<template>
  <ViewerContextMenuItem
    data-testid="modelStyleMenu"
    :index="index"
    tooltip="Style options"
    :btnImage="ModelColor"
  >
    <template #options>
      <ModelStyleCard :data-id="dataId" />
    </template>
  </ViewerContextMenuItem>
</template>
