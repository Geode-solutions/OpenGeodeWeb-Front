<script setup lang="ts">
import type { CollectionComponent } from "@ogw_front/stores/data_helpers/collections";
import type { CornerId } from "@ogw_front/types/identifiers";
import ViewerGenericModelCornerComponentOptions from "@ogw_front/components/Viewer/Generic/Model/CornerComponentOptions.vue";
import ViewerGenericModelCornersTypeOptions from "@ogw_front/components/Viewer/Generic/Model/CornersTypeOptions.vue";

interface Props {
  modelId: string;
  cornerId?: CornerId;
  targetCornerIds: string[];
  collections?: CollectionComponent[];
  activeTab?: string;
}

const {
  modelId,
  cornerId = undefined,
  targetCornerIds,
  collections = undefined,
  activeTab = undefined,
} = defineProps<Props>();
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
