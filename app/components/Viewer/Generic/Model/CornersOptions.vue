<script setup lang="ts">
import type { CornerId, ModelId } from "@ogw_front/types/identifiers";
import type { CollectionComponent } from "@ogw_internal/stores/data/model/collections";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import type { TabName } from "@ogw_front/types/ui";
import ViewerGenericModelCornerComponentOptions from "@ogw_front/components/Viewer/Generic/Model/CornerComponentOptions.vue";
import ViewerGenericModelCornersTypeOptions from "@ogw_front/components/Viewer/Generic/Model/CornersTypeOptions.vue";

interface Props {
  modelId: ModelId;
  targetCornerIds: NonEmptyArray<CornerId>;
  collections: CollectionComponent[] | undefined;
  activeTab: TabName | undefined;
  cornerId: CornerId | undefined;
}

const { modelId, cornerId, targetCornerIds, collections, activeTab } = defineProps<Props>();
</script>

<template>
  <ViewerGenericModelCornersTypeOptions
    :modelId="modelId"
    :targetCornerIds="targetCornerIds"
    :collections="collections"
    :activeTab="activeTab"
  />
  <ViewerGenericModelCornerComponentOptions
    v-if="cornerId"
    :modelId="modelId"
    :cornerId="cornerId"
    :activeTab="activeTab"
  />
</template>
