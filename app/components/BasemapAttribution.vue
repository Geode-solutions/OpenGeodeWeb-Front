<script setup lang="ts">
import { useBasemapStore } from "@ogw_front/stores/basemap";

const basemapStore = useBasemapStore();
</script>

<template>
  <span
    v-if="basemapStore.attribution"
    data-testid="basemapAttribution"
    class="basemap-attribution text-caption text-medium-emphasis px-1"
  >
    {{ basemapStore.attribution }}
  </span>
</template>

<style scoped>
.basemap-attribution {
  position: absolute;
  right: 8px;
  bottom: 4px;
  z-index: 1;
  background: rgba(var(--v-theme-surface), 0.6);
  border-radius: 4px;
  pointer-events: none;
}
</style>
