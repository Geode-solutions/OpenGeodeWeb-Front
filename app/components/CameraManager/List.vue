<script setup lang="ts">
import type { CameraPositionId, CameraPositionName } from "@ogw_internal/database/types";
import { useCameraManagerStore } from "@ogw_front/stores/camera_manager";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const cameraManagerStore = useCameraManagerStore();
const hybridViewerStore = useHybridViewerStore();

const savedPositions = cameraManagerStore.refAllCameraPositions();

const editingId = ref<CameraPositionId | undefined>(undefined);
const editingName = ref<CameraPositionName>("");

async function restorePosition(positionId: CameraPositionId): void {
  const position = await cameraManagerStore.getCameraPosition(positionId);
  if (position) {
    if (hybridViewerStore.genericRenderWindow) {
      hybridViewerStore.setCamera(position.camera_options);
    } else {
      await cameraManagerStore.restoreCameraPosition(positionId);
    }
  }
}

async function deletePosition(positionId: CameraPositionId): void {
  await cameraManagerStore.deleteCameraPosition(positionId);
}

function startEditing(position: { id?: CameraPositionId; name?: CameraPositionName }): void {
  editingId.value = position.id;
  editingName.value = position.name ?? "";
}

async function saveRename(): void {
  if (editingName.value && editingId.value !== undefined) {
    await cameraManagerStore.renameCameraPosition(editingId.value, editingName.value);
  }
  editingId.value = undefined;
}
</script>

<template>
  <v-list v-if="savedPositions.length > 0" class="bg-transparent pa-1">
    <v-list-item
      v-for="position in savedPositions"
      :key="position.id"
      class="rounded-lg mb-1 px-2"
      :active="editingId === position.id"
      active-color="primary"
    >
      <template #prepend>
        <v-btn
          icon
          variant="tonal"
          color="success"
          size="x-small"
          class="mr-1"
          :data-testid="`restoreCameraPosition${position.name}Button`"
          @click="restorePosition(position.id!)"
        >
          <v-icon size="14">ph-play</v-icon>
          <v-tooltip activator="parent" location="top">Restore</v-tooltip>
        </v-btn>
      </template>

      <v-list-item-title class="font-weight-semibold text-caption">
        <v-text-field
          v-if="editingId === position.id"
          v-model="editingName"
          density="compact"
          variant="underlined"
          hide-details
          autofocus
          class="text-caption"
          @keyup.enter="saveRename"
          @blur="saveRename"
        ></v-text-field>
        <span v-else>{{ position.name }}</span>
      </v-list-item-title>

      <template #append>
        <div class="d-flex ga-1">
          <v-btn
            icon
            variant="text"
            size="x-small"
            class="text-medium-emphasis"
            @click="startEditing(position)"
          >
            <v-icon size="14">ph-pencil-simple</v-icon>
            <v-tooltip activator="parent" location="top">Rename</v-tooltip>
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="x-small"
            color="error"
            @click="deletePosition(position.id!)"
          >
            <v-icon size="14">ph-trash</v-icon>
            <v-tooltip activator="parent" location="top">Delete</v-tooltip>
          </v-btn>
        </div>
      </template>
    </v-list-item>
  </v-list>
  <div v-else class="text-center text-medium-emphasis py-4 italic text-caption">
    <v-icon size="32" class="mb-1 d-block mx-auto opacity-20">ph-camera-slash</v-icon>
    No saved positions yet.
  </div>
</template>

<style scoped>
:deep(.v-list-item__prepend) {
  margin-inline-end: 6px !important;
}
:deep(.v-list-item__append) {
  margin-inline-start: 6px !important;
}
</style>
