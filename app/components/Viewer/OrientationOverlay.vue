<script setup lang="ts">
import {
  useOrientationMarkerVisible,
  useOrientationOverlay,
} from "@ogw_front/composables/orientation_overlay";
import ChromeTheme from "@ogw_front/components/ChromeTheme.vue";
import OrientationCompass from "@ogw_front/components/Viewer/OrientationCompass.vue";
import OrientationGlobe from "@ogw_front/components/Viewer/OrientationGlobe.vue";
import { toCameraPose } from "@ogw_front/utils/orientation_gizmo";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// Orientation marker drawn by the front in the bottom right corner of the viewer, where the viewer
// Draws its VTK marker otherwise. Opt-in: see `ogwFront.orientationOverlay` in app.config.ts.
const enabled = useOrientationOverlay();
const markerVisible = useOrientationMarkerVisible();
const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const hasCamera = computed(() => toCameraPose(hybridViewerStore.camera_options) !== undefined);
const marker = computed(() => dataStyleStore.sceneStyle.orientation_widget);
</script>

<template>
  <ChromeTheme v-if="enabled && markerVisible && hasCamera">
    <div class="orientation-overlay" data-testid="orientationOverlay">
      <OrientationCompass v-if="marker === 'compass'" />
      <OrientationGlobe v-else />
    </div>
  </ChromeTheme>
</template>

<style scoped>
/* Centered where the viewer draws its VTK marker (viewport 0.8-1 x 0-0.2), above the project CRS button */
.orientation-overlay {
  position: absolute;
  right: max(8px, calc(10% - 56px));
  bottom: max(40px, calc(10% - 56px));
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112px;
  height: 112px;
  pointer-events: none;
}
</style>
