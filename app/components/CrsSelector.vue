<script setup lang="ts">
import type { CRSList } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useCrsStore } from "@ogw_front/stores/crs";

interface Props {
  geodeObjectType: string;
}

const { geodeObjectType } = defineProps<Props>();
const selectedCrs = defineModel<CRSList | undefined>();

const search = ref<string>("");
const data_table_loading = ref<boolean>(false);
const crs_list = ref<CRSList[]>([]);
const selected_crs = ref<unknown[]>([]);
const toggle_loading = useToggle(data_table_loading);
const crsStore = useCrsStore();

// Codes are only unique within an authority (e.g. EPSG:4812 and ESRI:4812)
function crs_key(crs: CRSList): string {
  return `${crs.authority}:${crs.code}`;
}

function get_selected_crs(key: unknown): CRSList | undefined {
  return crs_list.value.find((crs) => crs_key(crs) === key);
}

watch(selected_crs, (new_value) => {
  selectedCrs.value = get_selected_crs(new_value[0]);
});

async function get_crs_table(): Promise<void> {
  toggle_loading();
  crs_list.value = await crsStore.geographicList(geodeObjectType);
  toggle_loading();
}

const headers = [
  {
    title: "Authority",
    align: "start",
    sortable: true,
    key: "authority",
  },
  { title: "Code", align: "end", key: "code" },
  { title: "Name", align: "end", key: "name" },
] as const;

// Not awaited in setup: the table renders right away with its loader
onMounted(async () => {
  await get_crs_table();
});
</script>

<template>
  <v-text-field
    v-model="search"
    data-testid="crsSearchInput"
    append-icon="mdi-magnify"
    label="Search"
    single-line
    hide-details
  ></v-text-field>
  <v-data-table
    v-model="selected_crs"
    :v-model:items-per-page="10"
    :headers="headers"
    :items="crs_list"
    :item-value="crs_key"
    class="elevation-1"
    density="compact"
    fixed-header
    select-strategy="single"
    show-select
    :search="search"
    :loading="data_table_loading"
    loading-text="Loading... Please wait"
  ></v-data-table>
</template>
