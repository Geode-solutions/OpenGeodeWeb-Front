<script setup>
import { useCameraManagerStore } from "@ogw_front/stores/camera_manager";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const cameraManagerStore = useCameraManagerStore();
const hybridViewerStore = useHybridViewerStore();

const newPositionName = ref("");

async function saveCurrentPosition() {
  if (!newPositionName.value) {
    return;
  }
  await cameraManagerStore.saveCameraPosition(
    newPositionName.value,
    toRaw(hybridViewerStore.camera_options),
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
          density="compact"
          variant="outlined"
          hide-details
          class="mb-2 text-caption"
          data-testid="cameraPositionNameInput"
        ></v-text-field>
      </v-col>
      <v-col cols="12" class="d-flex align-center">
        <v-btn
          color="primary"
          variant="elevated"
          block
          size="small"
          :disabled="!newPositionName"
          @click="saveCurrentPosition"
          height="32"
          class="text-caption font-weight-bold"
          data-testid="saveCameraPositionButton"
        >
          Save
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
