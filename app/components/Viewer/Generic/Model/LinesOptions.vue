<script setup lang="ts">
import type { LineId, ModelId } from "@ogw_front/types/identifiers";
import type { CollectionComponent } from "@ogw_internal/stores/data/model/collections";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import ViewerGenericModelLineComponentOptions from "@ogw_front/components/Viewer/Generic/Model/LineComponentOptions.vue";
import ViewerGenericModelLinesTypeOptions from "@ogw_front/components/Viewer/Generic/Model/LinesTypeOptions.vue";

interface Props {
  modelId: ModelId;
  lineId?: LineId;
  targetLineIds: NonEmptyArray<LineId>;
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
