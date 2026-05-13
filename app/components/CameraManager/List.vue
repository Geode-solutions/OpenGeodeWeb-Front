<script setup>
import { useCameraManagerStore } from "@ogw_front/stores/camera_manager";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const cameraManagerStore = useCameraManagerStore();
const hybridViewerStore = useHybridViewerStore();

const savedPositions = cameraManagerStore.refAllCameraPositions();

const editingId = ref(undefined);
const editingName = ref("");

async function restorePosition(positionId) {
  const position = await cameraManagerStore.getCameraPosition(positionId);
  if (position) {
    if (hybridViewerStore.genericRenderWindow) {
      hybridViewerStore.setCamera(position.camera_options);
    } else {
      await cameraManagerStore.restoreCameraPosition(positionId);
    }
  }
}

async function deletePosition(positionId) {
  await cameraManagerStore.deleteCameraPosition(positionId);
}

function startEditing(position) {
  editingId.value = position.id;
  editingName.value = position.name;
}

async function saveRename() {
  if (editingName.value) {
    await cameraManagerStore.renameCameraPosition(editingId.value, editingName.value);
  }
  editingId.value = undefined;
}
</script>

<template>
  <v-list v-if="savedPositions.length > 0" class="bg-transparent pa-2">
    <v-list-item
      v-for="position in savedPositions"
      :key="position.id"
      class="rounded-lg mb-1"
      :active="editingId === position.id"
      active-color="primary"
    >
      <template #prepend>
        <v-btn
          icon
          variant="tonal"
          color="success"
          size="small"
          class="mr-2"
          @click="restorePosition(position.id)"
        >
          <v-icon size="20">mdi-play</v-icon>
          <v-tooltip activator="parent" location="top">Restore</v-tooltip>
        </v-btn>
      </template>

      <v-list-item-title class="font-weight-bold">
        <v-text-field
          v-if="editingId === position.id"
          v-model="editingName"
          density="compact"
          variant="underlined"
          hide-details
          autofocus
          @keyup.enter="saveRename"
          @blur="saveRename"
        ></v-text-field>
        <span v-else>{{ position.name }}</span>
      </v-list-item-title>

      <template #append>
        <div class="d-flex g-1">
          <v-btn
            icon
            variant="text"
            size="small"
            color="grey-darken-1"
            @click="startEditing(position)"
          >
            <v-icon size="18">mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="top">Rename</v-tooltip>
          </v-btn>
          <v-btn
            icon
            variant="text"
            size="small"
            color="error"
            @click="deletePosition(position.id)"
          >
            <v-icon size="18">mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">Delete</v-tooltip>
          </v-btn>
        </div>
      </template>
    </v-list-item>
  </v-list>
  <div v-else class="text-center text-grey-lighten-1 py-8 italic">
    <v-icon size="48" class="mb-2 d-block mx-auto opacity-20">mdi-camera-off</v-icon>
    No saved positions yet.
  </div>
</template>

<style scoped>
:deep(.v-list-item__prepend) {
  margin-inline-end: 12px !important;
}
</style>
