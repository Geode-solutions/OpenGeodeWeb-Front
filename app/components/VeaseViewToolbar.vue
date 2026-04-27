<script setup>
import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import ActionButton from "@ogw_front/components/ActionButton.vue";
import CameraOrientation from "@ogw_front/components/CameraOrientation.vue";
import Screenshot from "@ogw_front/components/Screenshot";
import ZScaling from "@ogw_front/components/ZScaling";

import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

const hybridViewerStore = useHybridViewerStore();
const viewerStore = useViewerStore();
const take_screenshot = ref(false);
const showCameraOrientation = ref(false);
const showZScaling = ref(false);
const grid_scale = ref(false);
const zScale = ref(hybridViewerStore.zScale);

watch(
  () => hybridViewerStore.zScale,
  (newVal) => {
    zScale.value = newVal;
  },
);

async function handleZScalingClose() {
  await hybridViewerStore.setZScaling(zScale.value);
  showZScaling.value = false;
}

const camera_options = [
  {
    tooltip: "Reset camera",
    icon: "mdi-cube-scan",
    action: () => {
      hybridViewerStore.resetCamera();
    },
  },
  {
    tooltip: "Camera Orientation",
    icon: "mdi-axis-arrow",
    action: () => {
      showCameraOrientation.value = !showCameraOrientation.value;
    },
  },
  {
    tooltip: "Take a screenshot",
    icon: "mdi-camera",
    action: () => {
      take_screenshot.value = !take_screenshot.value;
    },
  },
  {
    tooltip: "Toggle grid scale",
    icon: "mdi-ruler-square",
    action: () => {
      viewerStore.request(
        schemas.opengeodeweb_viewer.viewer.grid_scale,
        { visibility: !grid_scale.value },
        {
          response_function: () => {
            grid_scale.value = !grid_scale.value;
            hybridViewerStore.remoteRender();
          },
        },
      );
    },
  },
  {
    tooltip: "Z Scaling Control",
    icon: "mdi-sort",
    action: () => {
      showZScaling.value = !showZScaling.value;
    },
  },
];
</script>

<template>
  <v-container :class="[$style.floatToolbar, 'pa-0']" width="auto">
    <v-row v-for="action in camera_options" :key="action.icon" dense>
      <v-col>
        <ActionButton :icon="action.icon" :tooltip="action.tooltip" @click.stop="action.action" />
      </v-col>
    </v-row>
  </v-container>
  <CameraOrientation v-if="showCameraOrientation" panel @close="showCameraOrientation = false" />
  <Screenshot :show_dialog="take_screenshot" @close="take_screenshot = false" />
  <ZScaling v-if="showZScaling" v-model="zScale" :width="400" @close="handleZScalingClose" />
</template>

<style module>
.floatToolbar {
  position: absolute;
  z-index: 2;
  right: 20px;
  top: 20px;
  background-color: rgba(0, 0, 0, 0);
}
</style>
