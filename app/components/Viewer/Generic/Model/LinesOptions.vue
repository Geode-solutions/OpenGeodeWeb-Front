<script setup lang="ts">
import type { LineId, ModelId } from "@ogw_front/types/identifiers";
import type { CollectionComponent } from "@ogw_internal/stores/data/model/collections";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import type { TabName } from "@ogw_front/types/ui";
import ViewerGenericModelLineComponentOptions from "@ogw_front/components/Viewer/Generic/Model/LineComponentOptions.vue";
import ViewerGenericModelLinesTypeOptions from "@ogw_front/components/Viewer/Generic/Model/LinesTypeOptions.vue";

interface Props {
  modelId: ModelId;
  targetLineIds: NonEmptyArray<LineId>;
  collections: CollectionComponent[] | undefined;
  activeTab: TabName | undefined;
  lineId: LineId | undefined;
}

const { modelId, lineId, targetLineIds, collections, activeTab } = defineProps<Props>();
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
