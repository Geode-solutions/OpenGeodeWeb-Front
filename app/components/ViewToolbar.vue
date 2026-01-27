<script setup>
  import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

  import Screenshot from "@ogw_front/components/Screenshot"
  import { useViewerStore } from "@ogw_front/stores/viewer"

  const viewerStore = useViewerStore()
  const take_screenshot = ref(false)
  const grid_scale = ref(false)

  const camera_options = [
    {
      tooltip: "Reset camera",
      icon: "mdi-cube-scan",
      action: () => {
        viewerStore.request(schemas.opengeodeweb_viewer.viewer.reset_camera)
      },
    },
    {
      tooltip: "Take a screenshot",
      icon: "mdi-camera",
      action: () => {
        take_screenshot.value = !take_screenshot.value
      },
    },
    {
      tooltip: "Toggle grid scale",
      icon: "mdi-ruler-square",
      action: () => {
        const viewerStore = useViewerStore()
        viewerStore.request(
          schemas.opengeodeweb_viewer.viewer.grid_scale,
          { visibility: !grid_scale.value },
          {
            response_function: () => {
              grid_scale.value = !grid_scale.value
            },
          },
        )
      },
    },
  ]
</script>

<template>
  <v-container :class="[$style.floatToolbar, 'pa-0']" width="auto">
    <v-row
      v-for="camera_option in camera_options"
      :key="camera_option.icon"
      dense
    >
      <v-col>
        <v-btn
          density="comfortable"
          icon
          @click.stop="camera_option.action"
          v-tooltip:left="camera_option.tooltip"
        >
          <v-icon :icon="camera_option.icon" size="32" />
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
  <Screenshot :show_dialog="take_screenshot" @close="take_screenshot = false" />
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
