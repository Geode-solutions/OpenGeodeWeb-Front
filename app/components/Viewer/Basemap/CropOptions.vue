<script setup lang="ts">
import { MAP_STYLES, mapStyleOf } from "@ogw_front/utils/basemap_tree";
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import BasemapAround from "@ogw_front/assets/viewer_svgs/basemap_around.svg";
import { useBasemapStore } from "@ogw_front/stores/basemap";

interface Props {
  itemProps: ItemProps & { index: number };
  tooltip?: string;
}

const { itemProps, tooltip = "Crop to data" } = defineProps<Props>();
const basemapStore = useBasemapStore();
// A map menu crops that map, the basemap category menu crops every map
const mapStyles = computed(() => {
  const mapStyle = mapStyleOf(itemProps.id);
  return mapStyle === undefined ? MAP_STYLES : [mapStyle];
});
// Cropped: only the map draped on the top surfaces, without the flat map around
const cropped = computed(() => mapStyles.value.map((mapStyle) => !basemapStore.around[mapStyle]));
const indeterminate = computed(() => new Set(cropped.value).size > 1);
</script>

<template>
  <ViewerContextMenuItem
    data-testid="basemapCropMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="BasemapAround"
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
        @update:model-value="(value) => basemapStore.setAround(!value, mapStyles)"
      />
    </template>
  </ViewerContextMenuItem>
</template>
