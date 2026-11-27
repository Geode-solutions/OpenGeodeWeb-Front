<script setup lang="ts">
import type { DataIdentified, GeodeObjectTyped } from "@ogw_front/types/identifiers";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { DataName } from "@ogw_front/types/data";
import type { FileName } from "@ogw_front/types/files";
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

import FetchingData from "@ogw_front/components/FetchingData.vue";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";

// A data a time series can be added to
interface TimeSeriesTarget extends DataIdentified, GeodeObjectTyped {
  name: DataName;
}

interface Props {
  filename: FileName;
}

interface Emits {
  update_values: [values: { target_id: DataId; geode_object_type: GeodeObjectType }];
  increment_step: [];
  decrement_step: [];
}

const schema = schemas.opengeodeweb_back.time_series_allowed_objects;

const emit = defineEmits<Emits>();

const { filename } = defineProps<Props>();

const loading = ref(true);
const targets = ref<TimeSeriesTarget[]>([]);

async function get_targets(): Promise<void> {
  const backStore = useBackStore();
  const dataStore = useDataStore();
  const [{ allowed_objects }, items] = await Promise.all([
    backStore.request({ schema, params: { filename } }),
    dataStore.allItems(),
  ]);
  targets.value = items
    .filter((item) => allowed_objects.includes(item.geode_object_type))
    .map(({ data_id, name, geode_object_type }) => ({ data_id, name, geode_object_type }));
  loading.value = false;
}

function select(target: TimeSeriesTarget): void {
  emit("update_values", { target_id: target.data_id, geode_object_type: target.geode_object_type });
  emit("increment_step");
}

// oxlint-disable-next-line no-top-level-await
await get_targets();
</script>

<template>
  <FetchingData v-if="loading" />
  <v-alert
    v-else-if="targets.length === 0"
    data-testid="noTimeSeriesTarget"
    type="warning"
    variant="tonal"
  >
    No compatible model loaded. Import a model (BRep) first, then drop the time series again.
  </v-alert>
  <v-list v-else bg-color="transparent">
    <v-list-item
      v-for="target in targets"
      :key="target.data_id"
      data-testid="timeSeriesTarget"
      :title="target.name"
      :subtitle="target.geode_object_type"
      prepend-icon="ph-cube"
      @click="select(target)"
    />
  </v-list>
</template>
