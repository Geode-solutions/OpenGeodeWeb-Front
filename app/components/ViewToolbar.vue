<script setup lang="ts">
import ActionButton from "@ogw_front/components/ActionButton.vue";
import CameraBookmarkIcon from "@ogw_front/assets/viewer_svgs/camera-bookmark.svg";
import CameraManager from "@ogw_front/components/CameraManager.vue";
import CameraOrientation from "@ogw_front/components/CameraOrientation.vue";
import ClippingPlanes from "@ogw_front/components/ClippingPlanes.vue";
import Ruler from "@ogw_front/components/Ruler.vue";
import Screenshot from "@ogw_front/components/Screenshot.vue";
import ShrinkFilter from "@ogw_front/components/ShrinkFilter.vue";
import ThresholdFilter from "@ogw_front/components/ThresholdFilter.vue";
import ZScaling from "@ogw_front/components/ZScaling.vue";
import { onKeyStroke } from "@vueuse/core";
import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

const hybridViewerStore = useHybridViewerStore();
const viewerStore = useViewerStore();
const showScreenshot = ref<boolean>(false);
const showCameraManager = ref<boolean>(false);
const showCameraOrientation = ref<boolean>(false);
const showZScaling = ref<boolean>(false);
const showClippingPlanes = ref<boolean>(false);
const showShrinkFilter = ref<boolean>(false);
const showThresholdFilter = ref<boolean>(false);
const showRuler = ref<boolean>(false);
const gridScale = ref<boolean>(false);
const zScale = ref<number>(hybridViewerStore.zScale);
const openSubMenus = ref<Record<string, boolean>>({});

interface CameraOptionAction {
  title?: string;
  testId: string;
  tooltip?: string;
  icon: string;
  iconSize?: number;
  color?: string;
  action?: () => void;
  menu?: CameraOptionAction[];
}

watch(
  () => hybridViewerStore.zScale,
  (newVal) => {
    zScale.value = newVal;
  },
);

async function handleZScalingClose(): Promise<void> {
  await hybridViewerStore.setZScaling(zScale.value);
  showZScaling.value = false;
}

onKeyStroke("Escape", () => {
  const openMenuKeys = Object.keys(openSubMenus.value).filter((key) => openSubMenus.value[key]);
  if (openMenuKeys.length > 0) {
    for (const key of openMenuKeys) {
      openSubMenus.value[key] = false;
    }
  }
});

function closeAllToolsExcept(toolRef: Ref<boolean>): void {
  const tools = [
    showCameraOrientation,
    showCameraManager,
    showScreenshot,
    showZScaling,
    showClippingPlanes,
    showShrinkFilter,
    showThresholdFilter,
    showRuler,
  ];
  for (const tool of tools) {
    if (tool !== toolRef) {
      tool.value = false;
    }
  }
}

function toggleTool(toolRef: Ref<boolean>): void {
  closeAllToolsExcept(toolRef);
  toolRef.value = !toolRef.value;
}

const camera_options = computed<CameraOptionAction[]>(() => [
  {
    testId: "resetCameraButton",
    tooltip: "Reset camera",
    icon: "mdi-cube-scan",
    action: (): void => {
      hybridViewerStore.resetCamera();
    },
  },
  {
    testId: "centerOnClickButton",
    tooltip: "Center on click",
    icon: "mdi-crosshairs-question",
    color: hybridViewerStore.is_picking ? "primary" : undefined,
    action: (): void => {
      hybridViewerStore.is_picking = !hybridViewerStore.is_picking;
    },
  },
  {
    testId: "highlightOnHoverButton",
    tooltip: "Highlight on hover",
    icon: "mdi-cursor-default-click",
    color: hybridViewerStore.is_hover_highlight ? "primary" : undefined,
    action: hybridViewerStore.is_hover_highlight
      ? (): void => {
          hybridViewerStore.is_hover_highlight = false;
          hybridViewerStore.clearHoverHighlight();
        }
      : undefined,
    menu: [
      {
        title: "Cells",
        testId: "highlightOnHoverCellsButton",
        icon: "mdi-select-all",
        action: (): void => {
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
        testId: "highlightOnHoverPointsButton",
        icon: "mdi-select-drag",
        action: (): void => {
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
    testId: "cameraOrientationButton",
    tooltip: "Camera orientation",
    icon: "mdi-rotate-3d",
    action: (): void => {
      toggleTool(showCameraOrientation);
    },
  },
  {
    testId: "cameraManagerButton",
    tooltip: "Manage camera positions",
    icon: CameraBookmarkIcon,
    iconSize: 34,
    action: (): void => {
      toggleTool(showCameraManager);
    },
  },
  {
    testId: "screenshotButton",
    tooltip: "Take a screenshot",
    icon: "mdi-camera",
    action: (): void => {
      toggleTool(showScreenshot);
    },
  },
  {
    testId: "gridScaleButton",
    tooltip: "Toggle grid scale",
    icon: "mdi-ruler-square",
    color: gridScale.value ? "primary" : undefined,
    action: (): void => {
      const schema = schemas.opengeodeweb_viewer.viewer.grid_scale;
      const params = { visibility: !gridScale.value };
      viewerStore.request(
        {
          schema,
          params,
        },
        {
          response_function: () => {
            gridScale.value = !gridScale.value;
            hybridViewerStore.remoteRender();
          },
        },
      );
    },
  },
  {
    testId: "zScalingButton",
    tooltip: "Z Scaling Control",
    icon: "mdi-sort",
    action: (): void => {
      toggleTool(showZScaling);
    },
  },
  {
    testId: "clippingPlanesButton",
    tooltip: "Clipping Planes",
    icon: "mdi-content-cut",
    color: showClippingPlanes.value ? "primary" : undefined,
    action: (): void => {
      toggleTool(showClippingPlanes);
    },
  },
  {
    testId: "shrinkFilterButton",
    tooltip: "Shrink Filter",
    icon: "mdi-arrow-collapse-all",
    color: showShrinkFilter.value ? "primary" : undefined,
    action: (): void => {
      toggleTool(showShrinkFilter);
    },
  },
  {
    testId: "thresholdFilterButton",
    tooltip: "Threshold Filter",
    icon: "mdi-filter-variant",
    color: showThresholdFilter.value ? "primary" : undefined,
    action: (): void => {
      toggleTool(showThresholdFilter);
    },
  },
  {
    testId: "rulerButton",
    tooltip: "Ruler",
    icon: "mdi-ruler",
    color: showRuler.value ? "primary" : undefined,
    action: (): void => {
      toggleTool(showRuler);
    },
  },
]);
</script>

<template>
  <v-container :class="[$style.floatToolbar, 'pa-0', 'view-toolbar']" width="auto">
    <v-row v-for="camera_option in camera_options" :key="camera_option.testId" dense>
      <v-col>
        <v-menu
          v-if="camera_option.menu && !camera_option.action"
          v-model="openSubMenus[camera_option.testId]"
          location="start"
          :close-on-content-click="false"
        >
          <template #activator="{ props }">
            <ActionButton
              v-bind="props"
              :data-testid="camera_option.testId"
              :icon="camera_option.icon"
              :tooltip="camera_option.tooltip ?? ''"
              :color="camera_option.color"
              :icon-size="camera_option.iconSize"
              tooltip-location="left"
            />
          </template>
          <v-card class="pa-1 mr-2" elevation="4" rounded="pill">
            <v-row dense>
              <v-col v-for="item in camera_option.menu" :key="item.title">
                <ActionButton
                  :data-testid="item.testId"
                  :icon="item.icon"
                  :tooltip="item.title ?? ''"
                  :color="
                    hybridViewerStore.is_hover_highlight &&
                    hybridViewerStore.hover_highlight_field_type ===
                      item.title?.toUpperCase().slice(0, -1)
                      ? 'primary'
                      : undefined
                  "
                  tooltip-location="top"
                  @click="item.action?.()"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-menu>
        <ActionButton
          v-else
          :data-testid="camera_option.testId"
          :icon="camera_option.icon"
          :tooltip="camera_option.tooltip ?? ''"
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
  <Screenshot v-model="showScreenshot" :escapeFunction="() => (showScreenshot = false)" />
  <CameraManager :showDialog="showCameraManager" @close="showCameraManager = false" />
  <ZScaling
    v-model:show="showZScaling"
    v-model="zScale"
    :width="260"
    :escapeFunction="handleZScalingClose"
    @apply="handleZScalingClose"
  />
  <ClippingPlanes
    v-model:show="showClippingPlanes"
    :escapeFunction="() => (showClippingPlanes = false)"
  />
  <ShrinkFilter
    v-model:show="showShrinkFilter"
    :escapeFunction="() => (showShrinkFilter = false)"
  />
  <ThresholdFilter
    v-model:show="showThresholdFilter"
    :escapeFunction="() => (showThresholdFilter = false)"
  />
  <Ruler v-model:show="showRuler" :escapeFunction="() => (showRuler = false)" />
</template>

<style module>
.floatToolbar {
  position: absolute;
  z-index: 1;
  right: 20px;
  top: 20px;
  background-color: rgba(0, 0, 0, 0);
}
</style>
