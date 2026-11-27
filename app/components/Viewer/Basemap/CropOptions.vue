<script setup lang="ts">
import { MAP_STYLES, mapStyleOf } from "@ogw_front/utils/basemap_tree";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import { useBasemapStore } from "@ogw_front/stores/basemap";

interface Props {
  dataId: DataId;
  index: number;
  tooltip?: string;
}

const { dataId, index, tooltip = "Crop to data" } = defineProps<Props>();
const basemapStore = useBasemapStore();
// A map menu crops that map, the basemap category menu crops every map
const mapStyles = computed(() => {
  const mapStyle = mapStyleOf(dataId);
  if (mapStyle === undefined) {
    return MAP_STYLES;
  }
  return [mapStyle];
});
// Cropped: only the map draped on the top surfaces, without the flat map around
const cropped = computed(() => mapStyles.value.map((mapStyle) => basemapStore.crop[mapStyle]));
const indeterminate = computed(() => new Set(cropped.value).size > 1);
</script>

<template>
  <ViewerContextMenuItem
    data-testid="basemapCropMenu"
    :index="index"
    :tooltip="tooltip"
    btnIcon="ph-panorama"
  >
    <template #options>
      <v-switch
        :model-value="!indeterminate && cropped.every(Boolean)"
        :indeterminate="indeterminate"
        label="Crop to data"
        data-testid="basemapCrop"
        density="compact"
        color="primary"
        hide-details
        class="px-1"
        @update:model-value="(value) => basemapStore.setCrop(Boolean(value), mapStyles)"
      />
    </template>
  </ViewerContextMenuItem>
</template>
