<script setup>
import ActionButton from "@ogw_front/components/ActionButton.vue";
import CameraBookmarkIcon from "@ogw_front/assets/viewer_svgs/camera-bookmark.svg";
import CameraManager from "@ogw_front/components/CameraManager";
import CameraOrientation from "@ogw_front/components/CameraOrientation.vue";
import Screenshot from "@ogw_front/components/Screenshot";
import ZScaling from "@ogw_front/components/ZScaling";
import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

const hybridViewerStore = useHybridViewerStore();
const viewerStore = useViewerStore();
const take_screenshot = ref(false);
const show_camera_manager = ref(false);
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

const camera_options = computed(() => [
  {
    tooltip: "Reset camera",
    icon: "mdi-cube-scan",
    action: () => {
      hybridViewerStore.resetCamera();
    },
  },
  {
    tooltip: "Center on click",
    icon: "mdi-crosshairs-question",
    color: hybridViewerStore.is_picking ? "primary" : undefined,
    action: () => {
      hybridViewerStore.is_picking = !hybridViewerStore.is_picking;
    },
  },
  {
    tooltip: "Highlight on hover",
    icon: "mdi-cursor-default-click",
    color: hybridViewerStore.is_hover_highlight ? "primary" : undefined,
    action: hybridViewerStore.is_hover_highlight
      ? () => {
          hybridViewerStore.is_hover_highlight = false;
          hybridViewerStore.clearHoverHighlight();
        }
      : undefined,
    menu: [
      {
        title: "Cells",
        icon: "mdi-select-all",
        action: () => {
          if (
            hybridViewerStore.is_hover_highlight &&
            hybridViewerStore.hover_highlight_field_type === "CELL"
          ) {
            hybridViewerStore.is_hover_highlight = false;
            hybridViewerStore.clearHoverHighlight();
          } else {
            hybridViewerStore.is_hover_highlight = true;
            hybridViewerStore.hover_highlight_field_type = "CELL";
          }
        },
      },
      {
        title: "Points",
        icon: "mdi-select-drag",
        action: () => {
          if (
            hybridViewerStore.is_hover_highlight &&
            hybridViewerStore.hover_highlight_field_type === "POINT"
          ) {
            hybridViewerStore.is_hover_highlight = false;
            hybridViewerStore.clearHoverHighlight();
          } else {
            hybridViewerStore.is_hover_highlight = true;
            hybridViewerStore.hover_highlight_field_type = "POINT";
          }
        },
      },
    ],
  },
  {
    tooltip: "Camera orientation",
    icon: "mdi-rotate-3d",
    action: () => {
      showCameraOrientation.value = !showCameraOrientation.value;
    },
  },
  {
    tooltip: "Manage camera positions",
    icon: CameraBookmarkIcon,
    iconSize: 34,
    action: () => {
      show_camera_manager.value = !show_camera_manager.value;
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
    color: grid_scale.value ? "primary" : undefined,
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
]);
</script>

<template>
  <v-container :class="[$style.floatToolbar, 'pa-0']" width="auto">
    <v-row v-for="camera_option in camera_options" :key="camera_option.icon" dense>
      <v-col>
        <v-menu v-if="camera_option.menu && !camera_option.action" location="start" :close-on-content-click="false">
          <template #activator="{ props }">
            <ActionButton
              v-bind="props"
              :icon="
                typeof camera_option.icon === 'function' ? camera_option.icon() : camera_option.icon
              "
              :tooltip="camera_option.tooltip"
              :color="camera_option.color"
              :icon-size="camera_option.iconSize"
              tooltip-location="left"
            />
          </template>
          <v-card class="pa-1 mr-2" elevation="4" rounded="pill">
            <v-row dense>
              <v-col v-for="item in camera_option.menu" :key="item.title">
                <ActionButton
                  :icon="item.icon"
                  :tooltip="item.title"
                  :color="
                    hybridViewerStore.is_hover_highlight &&
                    hybridViewerStore.hover_highlight_field_type ===
                      item.title.toUpperCase().slice(0, -1)
                      ? 'primary'
                      : undefined
                  "
                  tooltip-location="top"
                  @click="item.action"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-menu>
        <ActionButton
          v-else
          :icon="camera_option.icon"
          :tooltip="camera_option.tooltip"
          :color="camera_option.color"
          :icon-size="camera_option.iconSize"
          tooltip-location="left"
          @click.stop="camera_option.action?.()"
        />
      </v-col>
    </v-row>
  </v-container>
  <CameraOrientation
    v-model:show="showCameraOrientation"
    panel
    @select="hybridViewerStore.setCameraOrientation"
  />
  <Screenshot v-model="take_screenshot" />
  <CameraManager :show_dialog="show_camera_manager" @close="show_camera_manager = false" />
  <ZScaling
    v-model:show="showZScaling"
    v-model="zScale"
    :width="400"
    @apply="handleZScalingClose"
  />
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
