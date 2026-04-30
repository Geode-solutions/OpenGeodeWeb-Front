<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import { useCameraManagerStore } from "@ogw_front/stores/camera_manager";
import { useDataStore } from "@ogw_front/stores/data";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const emit = defineEmits(["close"]);

const { show_dialog, width } = defineProps({
  show_dialog: { type: Boolean, required: true },
  width: { type: Number, required: false, default: 450 },
});

const cameraManagerStore = useCameraManagerStore();
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();

const savedPositions = cameraManagerStore.refAllCameraPositions();
const allObjects = dataStore.refAllItems();

const newPositionName = ref("");
const selectedObjectId = ref(undefined);

const editingId = ref(undefined);
const editingName = ref("");

async function saveCurrentPosition() {
  if (!newPositionName.value) {
    return;
  }
  await cameraManagerStore.saveCameraPosition(newPositionName.value, selectedObjectId.value);
  newPositionName.value = "";
  selectedObjectId.value = undefined;
}

async function restorePosition(id) {
  const position = await cameraManagerStore.getCameraPosition(id);
  if (position) {
    if (hybridViewerStore.genericRenderWindow) {
      hybridViewerStore.setCamera(position.camera_options);
    } else {
      await cameraManagerStore.restoreCameraPosition(id);
    }
  }
}

async function deletePosition(id) {
  await cameraManagerStore.deleteCameraPosition(id);
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

function getObjectName(objectId) {
  if (!objectId) {
    return "None";
  }
  const obj = allObjects.value.find((o) => o.id === objectId);
  return obj ? obj.name : "Unknown";
}
</script>

<template>
  <GlassCard
    v-if="show_dialog"
    @click.stop
    title="Camera Positions"
    :width="width"
    :ripple="false"
    variant="panel"
    padding="pa-0"
    class="position-absolute elevation-24"
    style="z-index: 2; top: 90px; right: 55px"
  >
    <v-card-text class="pa-0">
      <!-- Save Current Position Section -->
      <v-container class="pa-5 pb-2 bg-surface-variant-lighten-5">
        <v-row dense>
          <v-col cols="12">
            <v-text-field
              v-model="newPositionName"
              label="Position Name"
              placeholder="e.g. Front View"
              density="compact"
              variant="outlined"
              hide-details
              class="mb-3"
            ></v-text-field>
          </v-col>
          <v-col cols="8">
            <v-select
              v-model="selectedObjectId"
              :items="allObjects"
              item-title="name"
              item-value="id"
              label="Attach to Object"
              placeholder="Optional"
              density="compact"
              variant="outlined"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="4" class="d-flex align-center">
            <v-btn
              color="primary"
              variant="elevated"
              block
              :disabled="!newPositionName"
              @click="saveCurrentPosition"
              height="40"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

      <v-divider></v-divider>

      <!-- Saved Positions List -->
      <v-list v-if="savedPositions.length > 0" class="bg-transparent pa-2" lines="two">
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

          <v-list-item-subtitle v-if="editingId !== position.id">
            <v-icon size="14" class="mr-1">mdi-paperclip</v-icon>
            {{ getObjectName(position.object_id) }}
          </v-list-item-subtitle>

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
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn variant="text" color="grey-darken-1" @click="emit('close')">Close</v-btn>
    </v-card-actions>
  </GlassCard>
</template>

<style scoped>
:deep(.v-list-item__prepend) {
  margin-inline-end: 12px !important;
}
</style>
