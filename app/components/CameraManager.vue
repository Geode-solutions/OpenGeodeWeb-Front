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
  await cameraManagerStore.saveCameraPosition(
    newPositionName.value,
    selectedObjectId.value,
  );
  newPositionName.value = "";
  selectedObjectId.value = undefined;
}

async function restorePosition(id) {
  const position = await cameraManagerStore.getCameraPosition(id);
  if (position) {
    if (hybridViewerStore.status === "CREATED") {
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
    await cameraManagerStore.renameCameraPosition(
      editingId.value,
      editingName.value,
    );
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
    <v-card-text class="pa-5">
      <v-container class="pa-0">
        <!-- Save Current Position Section -->
        <v-row dense align="center">
          <v-col cols="5">
            <v-text-field
              v-model="newPositionName"
              label="Name"
              density="compact"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-select
              v-model="selectedObjectId"
              :items="allObjects"
              item-title="name"
              item-value="id"
              label="Attach to (optional)"
              density="compact"
              hide-details
              clearable
            ></v-select>
          </v-col>
          <v-col cols="3" class="text-right">
            <v-btn
              color="primary"
              variant="elevated"
              size="small"
              :disabled="!newPositionName"
              @click="saveCurrentPosition"
            >
              Save
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <!-- Saved Positions List -->
        <v-list v-if="savedPositions.length > 0" class="bg-transparent pa-0">
          <v-list-item
            v-for="position in savedPositions"
            :key="position.id"
            class="px-0"
            :ripple="false"
          >
            <template #prepend>
              <v-btn
                icon="mdi-play"
                variant="text"
                color="success"
                size="small"
                @click="restorePosition(position.id)"
              >
                <v-tooltip activator="parent" location="top">Restore</v-tooltip>
              </v-btn>
            </template>

            <v-list-item-title>
              <template v-if="editingId === position.id">
                <v-text-field
                  v-model="editingName"
                  density="compact"
                  hide-details
                  autofocus
                  @keyup.enter="saveRename"
                  @blur="saveRename"
                ></v-text-field>
              </template>
              <template v-else>
                <span class="font-weight-bold">{{ position.name }}</span>
                <div class="text-caption text-grey">
                  Attached to: {{ getObjectName(position.object_id) }}
                </div>
              </template>
            </v-list-item-title>

            <template #append>
              <v-btn
                icon="mdi-pencil"
                variant="text"
                size="small"
                @click="startEditing(position)"
              >
                <v-tooltip activator="parent" location="top">Rename</v-tooltip>
              </v-btn>
              <v-btn
                icon="mdi-delete"
                variant="text"
                color="error"
                size="small"
                @click="deletePosition(position.id)"
              >
                <v-tooltip activator="parent" location="top">Delete</v-tooltip>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
        <div v-else class="text-center text-grey py-4">
          No saved positions yet.
        </div>
      </v-container>
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-end pb-4 px-5">
        <v-btn variant="text" color="primary" @click="emit('close')"
          >Close</v-btn
        >
      </v-card-actions>
    </template>
  </GlassCard>
</template>

<style scoped>
:deep(.v-list-item__prepend) {
  margin-inline-end: 12px !important;
}
</style>
