<script setup lang="ts">
import ActionButton from "@ogw_front/components/ActionButton.vue";
import CameraManager from "@ogw_front/components/CameraManager.vue";
import CameraOrientation from "@ogw_front/components/CameraOrientation.vue";
import ClippingPlanes from "@ogw_front/components/ClippingPlanes.vue";
import ExplodeFilter from "@ogw_front/components/ExplodeFilter.vue";
import Ruler from "@ogw_front/components/Ruler.vue";
import Screenshot from "@ogw_front/components/Screenshot.vue";
import ShrinkFilter from "@ogw_front/components/ShrinkFilter.vue";
import ThresholdFilter from "@ogw_front/components/ThresholdFilter.vue";
import ZScaling from "@ogw_front/components/ZScaling.vue";
import { onKeyStroke } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewToolbarOptions } from "@ogw_front/composables/view_toolbar_options";
import { useViewToolbarTools } from "@ogw_front/composables/view_toolbar_tools";

const hybridViewerStore = useHybridViewerStore();
const tools = useViewToolbarTools();
const {
  showScreenshot,
  showCameraManager,
  showCameraOrientation,
  showZScaling,
  showClippingPlanes,
  showShrinkFilter,
  showExplodeFilter,
  showThresholdFilter,
  showRuler,
} = tools;
const zScale = ref<number>(hybridViewerStore.zScale);
const openSubMenus = ref<Record<string, boolean>>({});
const camera_options = useViewToolbarOptions(tools);

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
</script>

<template>
  <v-container :class="[$style.floatToolbar, 'pa-0', 'view-toolbar']" width="auto">
    <v-row v-for="camera_option in camera_options" :key="camera_option.testId" density="compact">
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
            <v-row density="compact">
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
  <ExplodeFilter
    v-model:show="showExplodeFilter"
    :escapeFunction="() => (showExplodeFilter = false)"
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
