<script setup lang="ts">
import { useBasemapStore } from "@ogw_front/stores/basemap";

const basemapStore = useBasemapStore();
// A hidden basemap stays built: its attribution goes with its maps
</script>

<template>
  <span
    v-if="basemapStore.attribution && basemapStore.maps.length > 0"
    data-testid="basemapAttribution"
    class="basemap-attribution text-caption text-medium-emphasis px-1"
  >
    {{ basemapStore.attribution }}
  </span>
</template>

<style scoped>
.basemap-attribution {
  position: absolute;
  left: 8px;
  bottom: 4px;
  z-index: 1;
  background: rgba(var(--v-theme-surface), 0.6);
  border-radius: 4px;
  pointer-events: none;
}
</style>
