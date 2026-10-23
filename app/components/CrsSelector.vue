<script setup lang="ts">
import type { CRSList } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useCrsStore } from "@ogw_front/stores/crs";

interface Props {
  geodeObjectType: string;
  // Narrow containers: one "AUTHORITY:CODE" column and a truncated name
  compact?: boolean;
}

const { geodeObjectType, compact = false } = defineProps<Props>();
const selectedCrs = defineModel<CRSList | undefined>();

const search = ref<string>("");
const data_table_loading = ref<boolean>(false);
// Thousands of rows that are never mutated: no deep reactivity
const crs_list = shallowRef<CRSList[]>([]);
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

const full_headers = [
  {
    title: "Authority",
    align: "start",
    sortable: true,
    key: "authority",
  },
  { title: "Code", align: "end", key: "code" },
  { title: "Name", align: "end", key: "name" },
] as const;

// A max width of 0 lets the name take the remaining space and truncate instead of wrapping
const compact_headers = [
  { title: "Code", align: "start", key: "code", value: crs_key, width: 110, nowrap: true },
  { title: "Name", align: "start", key: "name", maxWidth: 0, nowrap: true },
] as const;

// "All" would render the whole list (thousands of rows) at once
// oxlint-disable-next-line no-magic-numbers -- the page sizes Vuetify offers by default, "All" aside
const items_per_page_options = [10, 25, 50, 100];

const headers = computed(() => (compact ? compact_headers : full_headers));

// Not awaited in setup: the table renders right away with its loader
onMounted(async () => {
  await get_crs_table();
});
</script>

<template>
  <v-text-field
    v-model="search"
    data-testid="crsSearchInput"
    :append-icon="compact ? undefined : 'mdi-magnify'"
    :prepend-inner-icon="compact ? 'mdi-magnify' : undefined"
    label="Search"
    single-line
    hide-details
  ></v-text-field>
  <v-data-table
    v-model="selected_crs"
    :items-per-page="10"
    :items-per-page-options="items_per_page_options"
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
  >
    <template v-if="compact" #[`item.name`]="{ value }">
      <v-tooltip :text="value" location="top">
        <template #activator="{ props: tooltipProps }">
          <span v-bind="tooltipProps">{{ value }}</span>
        </template>
      </v-tooltip>
    </template>
  </v-data-table>
</template>
