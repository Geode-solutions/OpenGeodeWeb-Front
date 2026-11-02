<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import BasemapAround from "@ogw_front/assets/viewer_svgs/basemap_around.svg";
import { useBasemapStore } from "@ogw_front/stores/basemap";

interface Props {
  itemProps: ItemProps & { index: number };
  tooltip?: string;
}

const { itemProps, tooltip = "Map around" } = defineProps<Props>();
const basemapStore = useBasemapStore();
</script>

<template>
  <ViewerContextMenuItem
    data-testid="basemapAroundMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="BasemapAround"
  >
    <template #options>
      <!-- The flat map around the top surfaces draped with the map -->
      <v-switch
        :model-value="basemapStore.around"
        label="Map around"
        data-testid="basemapAround"
        density="compact"
        color="primary"
        hide-details
        class="px-1"
        @update:model-value="(value) => basemapStore.setAround(Boolean(value))"
      />
    </template>
  </ViewerContextMenuItem>
</template>
