<script setup lang="ts">
import type { PropType } from "vue";
import FetchingData from "@ogw_front/components/FetchingData.vue";
import geode_objects from "@ogw_front/assets/geode_objects";
import { resolveAllowedObjects } from "@ogw_shared/utils/response_handlers/load.js";
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { useBackStore } from "@ogw_front/stores/back";

// Mirrors the (unexported) shape produced by shared/utils/response_handlers/load.ts.
type AllowedObject = { is_loadable: number; object_priority?: number };
type AllowedObjectMap = Record<string, AllowedObject>;

const schema = schemas.opengeodeweb_back.allowed_objects;

const emit = defineEmits(["update_values", "increment_step"]);

const { filenames } = defineProps({
  filenames: { type: Array as PropType<string[]>, required: true },
});

const backStore = useBackStore();

const loading = ref(false);
const allowedGeodeObjects = ref<AllowedObjectMap>({});
const toggleLoading = useToggle(loading);
const multipleFilesNoCommon = ref(false);

async function fetchAllowedObjectsList(): Promise<AllowedObjectMap[]> {
  const promiseArray = filenames.map((filename): Promise<{ allowed_objects: AllowedObjectMap }> => {
    const params = { filename };
    return backStore.request({ schema, params });
  });
  const responses = await Promise.all(promiseArray);
  return responses.map((response) => response.allowed_objects);
}

function setGeodeObject(geode_object_type: string | undefined) {
  if (geode_object_type) {
    emit("update_values", { geode_object_type });
    emit("increment_step");
  }
}

// The geode_objects lookup is fixed and keyed by known object type names; a missing entry only happens if the backend reports a type this table doesn't know about.
function geodeObjectTooltip(key: string, isLoadable: boolean) {
  return isLoadable
    ? (geode_objects[key]?.tooltip ?? key)
    : `Data not loadable with this class (${key})`;
}

function geodeObjectImage(key: string) {
  return geode_objects[key]?.image;
}

async function getAllowedGeodeObjects() {
  toggleLoading();
  allowedGeodeObjects.value = {};
  multipleFilesNoCommon.value = false;

  const allowedGeodeObjectsList = await fetchAllowedObjectsList();
  const resolved = resolveAllowedObjects(filenames, allowedGeodeObjectsList);

  allowedGeodeObjects.value = resolved.mergedAllowedObjects;
  multipleFilesNoCommon.value = resolved.multipleFilesNoCommon;
  if (resolved.selectedGeodeObject) {
    setGeodeObject(resolved.selectedGeodeObject);
  }
  toggleLoading();
}
// oxlint-disable-next-line no-top-level-await
await getAllowedGeodeObjects();
</script>

<template>
  <FetchingData v-if="loading" />
  <v-row v-else-if="Object.keys(allowedGeodeObjects).length" class="justify-left">
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
  <v-row v-else class="pa-5">
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
