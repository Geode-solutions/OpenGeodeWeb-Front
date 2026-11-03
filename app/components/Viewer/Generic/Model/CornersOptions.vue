<script setup lang="ts">
import type { CollectionComponent } from "@ogw_front/stores/data_helpers/collections";
import ViewerGenericModelCornerComponentOptions from "@ogw_front/components/Viewer/Generic/Model/CornerComponentOptions.vue";
import ViewerGenericModelCornersTypeOptions from "@ogw_front/components/Viewer/Generic/Model/CornersTypeOptions.vue";

interface Props {
  modelId: string;
  cornerId?: string;
  targetCornerIds: string[];
  collections?: CollectionComponent[];
}

const {
  modelId,
  cornerId = undefined,
  targetCornerIds,
  collections = undefined,
} = defineProps<Props>();
</script>

<template>
  <ViewerGenericModelCornersTypeOptions
    :modelId="modelId"
    :targetCornerIds="targetCornerIds"
    :collections="collections"
  />
  <ViewerGenericModelCornerComponentOptions
    v-if="cornerId"
    :modelId="modelId"
    :cornerId="cornerId"
  />
</template>
