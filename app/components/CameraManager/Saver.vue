<script setup lang="ts">
import { useCameraManagerStore } from "@ogw_front/stores/camera_manager";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types.js";

const cameraManagerStore = useCameraManagerStore();
const hybridViewerStore = useHybridViewerStore();

const newPositionName = ref("");

async function saveCurrentPosition() {
  if (!newPositionName.value) {
    return;
  }
  await cameraManagerStore.saveCameraPosition(
    newPositionName.value,
    // hybridViewerStore.camera_options is a loosely-typed reactive object (it's
    // populated dynamically from the viewer's camera state), but is always a
    // CameraOptions shape at runtime once the viewer has synced a camera.
    toRaw(hybridViewerStore.camera_options) as unknown as CameraOptions,
  );
  newPositionName.value = "";
}
</script>

<template>
  <v-container class="pa-3 pb-1 bg-surface-variant-lighten-5">
    <v-row dense>
      <v-col cols="12">
        <v-text-field
          v-model="newPositionName"
          label="Position Name"
          placeholder="e.g. Front View"
          data-testid="cameraPositionNameInput"
          density="compact"
          variant="outlined"
          hide-details
          class="mb-2 text-caption"
        ></v-text-field>
      </v-col>
      <v-col cols="12" class="d-flex align-center">
        <v-btn
          color="primary"
          variant="elevated"
          block
          size="small"
          data-testid="saveCameraPositionButton"
          :disabled="!newPositionName"
          @click="saveCurrentPosition"
          height="32"
          class="text-caption font-weight-bold"
        >
          Save
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
