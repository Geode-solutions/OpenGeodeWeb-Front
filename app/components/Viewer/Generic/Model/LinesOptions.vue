<script setup lang="ts">
import type { CollectionComponent } from "@ogw_front/stores/data_helpers/collections";
import ViewerGenericModelLineComponentOptions from "@ogw_front/components/Viewer/Generic/Model/LineComponentOptions.vue";
import ViewerGenericModelLinesTypeOptions from "@ogw_front/components/Viewer/Generic/Model/LinesTypeOptions.vue";

interface Props {
  modelId: string;
  lineId?: string;
  targetLineIds: string[];
  collections?: CollectionComponent[];
}

const {
  modelId,
  lineId = undefined,
  targetLineIds,
  collections = undefined,
} = defineProps<Props>();
</script>

<template>
  <ViewerGenericModelLinesTypeOptions
    :modelId="modelId"
    :targetLineIds="targetLineIds"
    :collections="collections"
  />
  <ViewerGenericModelLineComponentOptions v-if="lineId" :modelId="modelId" :lineId="lineId" />
</template>
