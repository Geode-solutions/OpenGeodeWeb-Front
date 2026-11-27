<script setup lang="ts">
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import { mapStyleOf } from "@ogw_front/utils/basemap_tree";
import { useBasemapStore } from "@ogw_front/stores/basemap";

interface Props {
  dataId: DataId;
  index: number;
  tooltip?: string;
}

const { dataId, index, tooltip = "Opacity" } = defineProps<Props>();
const basemapStore = useBasemapStore();
const PERCENT = 100;
const mapStyle = computed(() => mapStyleOf(dataId));
// The slider works in percent, the store in 0..1
const opacityPercent = computed({
  get: () => Math.round((mapStyle.value ? basemapStore.opacities[mapStyle.value] : 1) * PERCENT),
  set: (value: number) => {
    if (mapStyle.value) {
      void basemapStore.setOpacity(mapStyle.value, value / PERCENT);
    }
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="basemapOpacityMenu"
    :index="index"
    :tooltip="tooltip"
    btnIcon="ph-circle-half"
  >
    <template #options>
      <div class="d-flex align-center ga-2 px-1">
        <v-slider
          v-model="opacityPercent"
          data-testid="basemapOpacity"
          :min="10"
          :max="100"
          :step="5"
          density="compact"
          color="primary"
          hide-details
        />
        <span class="text-caption text-right" style="min-width: 4ch">{{ opacityPercent }}%</span>
      </div>
    </template>
  </ViewerContextMenuItem>
</template>
