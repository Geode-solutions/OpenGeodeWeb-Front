<script setup lang="ts">
import {
  type FileAllowedObjects,
  resolveAllowedObjects,
  resolveAllowedObjectsPerFile,
} from "@ogw_shared/utils/response_handlers/load.js";
import FetchingData from "@ogw_front/components/FetchingData.vue";
import { geode_objects } from "@ogw_front/assets/geode_objects";
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useBackStore } from "@ogw_front/stores/back";

// Mirrors the (unexported) shape produced by shared/utils/response_handlers/load.ts.
interface AllowedObject {
  is_loadable: number;
  object_priority?: number;
}
type AllowedObjectMap = Record<string, AllowedObject>;

const schema = schemas.opengeodeweb_back.allowed_objects;

interface PendingGroup {
  filenames: string[];
  candidates: string[];
  selected: string;
}

const emit = defineEmits<{
  // Filename -> geode object type, files that cannot be loaded are left out
  update_values: [value: { geode_object_types: Record<string, string> }];
  increment_step: [];
}>();

interface Props {
  filenames: string[];
}

const { filenames } = defineProps<Props>();

const backStore = useBackStore();

const loading = ref<boolean>(false);
const allowedGeodeObjects = ref<AllowedObjectMap>({});
const toggleLoading = useToggle(loading);
const multipleFilesNoCommon = ref<boolean>(false);
// Types already known, files left to choose for, and files that cannot be loaded
const resolvedTypes = ref<Record<string, string>>({});
const pendingFilenames = ref<string[]>([]);
const pendingGroups = ref<PendingGroup[]>([]);
const skippedFiles = ref<string[]>([]);
const showPerFile = ref<boolean>(false);
// Every file got its type without the user, nothing to display
const autoResolved = ref<boolean>(false);

async function fetchAllowedObjectsList(): Promise<AllowedObjectMap[]> {
  const promiseArray = filenames.map((filename): Promise<{ allowed_objects: AllowedObjectMap }> => {
    const params = { filename };
    return backStore.request({ schema, params });
  });
  const responses = await Promise.all(promiseArray);
  return responses.map((response) => response.allowed_objects);
}

function emitGeodeObjectTypes(geode_object_types: Record<string, string>): void {
  emit("update_values", { geode_object_types });
  emit("increment_step");
}

function setGeodeObject(geode_object_type: string | undefined): void {
  if (!geode_object_type) {
    return;
  }
  const chosen = pendingFilenames.value.map((filename) => [filename, geode_object_type]);
  emitGeodeObjectTypes({ ...resolvedTypes.value, ...Object.fromEntries(chosen) });
}

function confirmPerFile(): void {
  const chosen = pendingGroups.value.flatMap((group) =>
    group.filenames.map((filename) => [filename, group.selected]),
  );
  emitGeodeObjectTypes({ ...resolvedTypes.value, ...Object.fromEntries(chosen) });
}

// Files with the same candidate types share one choice
function groupPendingFiles(pending: readonly FileAllowedObjects[]): PendingGroup[] {
  const groups = new Map<string, PendingGroup>();
  for (const file of pending) {
    const key = file.candidates.join(",");
    const group = groups.get(key);
    if (group) {
      group.filenames.push(file.filename);
    } else {
      groups.set(key, {
        filenames: [file.filename],
        candidates: file.candidates,
        selected: file.candidates[0] ?? "",
      });
    }
  }
  return [...groups.values()];
}

// The geode_objects lookup is fixed and keyed by known object type names; a missing entry only happens if the backend reports a type this table doesn't know about.
function geodeObjectTooltip(key: string, isLoadable: boolean): string {
  return isLoadable
    ? (geode_objects[key]?.tooltip ?? key)
    : `Data not loadable with this class (${key})`;
}

function geodeObjectImage(key: string): string | undefined {
  return geode_objects[key]?.image;
}

function showCommonGeodeObjects(
  pendingNames: readonly string[],
  allowedObjectsList: readonly AllowedObjectMap[],
): string | undefined {
  const resolved = resolveAllowedObjects(pendingNames, allowedObjectsList);
  allowedGeodeObjects.value = resolved.mergedAllowedObjects;
  multipleFilesNoCommon.value = resolved.multipleFilesNoCommon;
  return resolved.selectedGeodeObject;
}

// Each file gets its own type. Returns true when the per file panel is needed, i.e. the files cannot be handled by a single choice
function resolvePerFile(allowedObjectsList: readonly AllowedObjectMap[]): boolean {
  const files = resolveAllowedObjectsPerFile(filenames, allowedObjectsList);
  const loadable = files.filter((file) => file.candidates.length > 0);
  if (loadable.length === 0) {
    // Nothing can be loaded: show why with the common types
    showCommonGeodeObjects(filenames, allowedObjectsList);
    return false;
  }
  const pending = loadable.filter((file) => file.selectedGeodeObject === undefined);
  resolvedTypes.value = Object.fromEntries(
    loadable.flatMap((file) =>
      file.selectedGeodeObject === undefined ? [] : [[file.filename, file.selectedGeodeObject]],
    ),
  );
  pendingFilenames.value = pending.map((file) => file.filename);
  skippedFiles.value = files
    .filter((file) => file.candidates.length === 0)
    .map((file) => file.filename);
  if (skippedFiles.value.length === 0) {
    if (pending.length === 0) {
      autoResolved.value = true;
      emitGeodeObjectTypes(resolvedTypes.value);
      return false;
    }
    const pendingAllowedObjects = pending.map(
      (file) => allowedObjectsList[filenames.indexOf(file.filename)] ?? {},
    );
    // Pending files sharing a loadable type: one choice for all of them
    const selected = showCommonGeodeObjects(pendingFilenames.value, pendingAllowedObjects);
    if (Object.values(allowedGeodeObjects.value).some((object) => object.is_loadable > 0)) {
      setGeodeObject(selected);
      return false;
    }
  }
  pendingGroups.value = groupPendingFiles(pending);
  return true;
}

async function getAllowedGeodeObjects(): Promise<void> {
  toggleLoading();
  allowedGeodeObjects.value = {};
  multipleFilesNoCommon.value = false;
  showPerFile.value = false;

  const allowedGeodeObjectsList = await fetchAllowedObjectsList();
  showPerFile.value = resolvePerFile(allowedGeodeObjectsList);
  toggleLoading();
}
// oxlint-disable-next-line no-top-level-await
await getAllowedGeodeObjects();
</script>

<template>
  <FetchingData v-if="loading" />
  <v-container v-else-if="showPerFile" data-testid="perFileObjectSelector">
    <v-row v-for="group in pendingGroups" :key="group.filenames.join()" align="center">
      <v-col cols="auto" class="pa-1">
        <v-chip v-for="filename in group.filenames" :key="filename" class="ma-1" size="small">
          {{ filename }}
        </v-chip>
      </v-col>
      <v-col class="pa-1">
        <v-select
          v-model="group.selected"
          :items="group.candidates"
          density="compact"
          hide-details
          variant="outlined"
        />
      </v-col>
    </v-row>
    <v-row v-for="(type, filename) in resolvedTypes" :key="filename" align="center">
      <v-chip class="ma-1" size="small">{{ filename }}</v-chip>
      <v-chip class="ma-1" size="small" variant="tonal">{{ type }}</v-chip>
    </v-row>
    <v-row v-if="skippedFiles.length" align="center">
      <v-icon color="warning" icon="mdi-file-alert-outline" class="ma-1" />
      <p class="pa-1">Not supported, will be skipped:</p>
      <v-chip v-for="filename in skippedFiles" :key="filename" class="ma-1" size="small">
        {{ filename }}
      </v-chip>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <v-btn color="primary" data-testid="confirmDataTypesButton" @click="confirmPerFile">
          Continue
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
  <v-row v-else-if="Object.keys(allowedGeodeObjects).length" class="justify-left">
    <v-col v-if="pendingFilenames.length && pendingFilenames.length < filenames.length" cols="12">
      Choose the data type for: {{ pendingFilenames.join(", ") }}
    </v-col>
    <v-col v-for="(value, key) in allowedGeodeObjects" :key="key" cols="3" md="4">
      <v-tooltip :text="geodeObjectTooltip(key, Boolean(value['is_loadable']))" location="bottom">
        <template v-slot:activator="{ props }">
          <span v-bind="props">
            <v-card
              v-ripple
              class="card ma-2"
              hover
              rounded
              @click="setGeodeObject(key)"
              :disabled="!value['is_loadable']"
              :elevation="value['is_loadable'] ? 5 : 3"
            >
              <v-img
                :src="geodeObjectImage(key)"
                cover
                :class="!value['is_loadable'] ? 'disabled' : undefined"
              />
            </v-card>
          </span>
        </template>
      </v-tooltip>
    </v-col>
  </v-row>
  <v-row v-else-if="multipleFilesNoCommon" class="pa-5">
    <v-card class="card" variant="tonal" rounded>
      <v-card-text>
        These files cannot be loaded together because they don't share a common data type.
      </v-card-text>
    </v-card>
  </v-row>
  <v-row v-else-if="!autoResolved" class="pa-5">
    <v-card class="card" variant="tonal" rounded>
      <v-card-text>
        This file format isn't supported! Please check the
        <a href="https://docs.geode-solutions.com/guides/formats/" target="_blank">
          supported file formats documentation</a
        >
        for more information
      </v-card-text>
    </v-card>
  </v-row>
</template>

<style scoped>
.disabled {
  filter: opacity(0.7);
  cursor: pointer;
}

.disabled div {
  cursor: not-allowed;
}
</style>
