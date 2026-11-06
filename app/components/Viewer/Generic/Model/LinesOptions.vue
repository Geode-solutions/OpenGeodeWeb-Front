<script setup lang="ts">
import type { CollectionComponent } from "@ogw_front/stores/data_helpers/collections";
import type { LineId } from "@ogw_front/types/identifiers";
import ViewerGenericModelLineComponentOptions from "@ogw_front/components/Viewer/Generic/Model/LineComponentOptions.vue";
import ViewerGenericModelLinesTypeOptions from "@ogw_front/components/Viewer/Generic/Model/LinesTypeOptions.vue";

interface Props {
  modelId: string;
  lineId?: LineId;
  targetLineIds: string[];
  collections?: CollectionComponent[];
  activeTab?: string;
}

const {
  modelId,
  lineId = undefined,
  targetLineIds,
  collections = undefined,
  activeTab = undefined,
} = defineProps<Props>();
</script>

<template>
  <ViewerGenericModelLinesTypeOptions
    :modelId="modelId"
    :targetLineIds="targetLineIds"
    :collections="collections"
    :activeTab="activeTab"
  />
  <ViewerGenericModelLineComponentOptions
    v-if="lineId"
    :modelId="modelId"
    :lineId="lineId"
    :activeTab="activeTab"
  />
</template>
