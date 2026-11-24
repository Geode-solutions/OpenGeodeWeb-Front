<script setup lang="ts">
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import { useCrsStore } from "@ogw_front/stores/crs";

interface Props {
  geodeObjectType: GeodeObjectType;
  // Narrow containers: one "AUTHORITY:CODE" column and a truncated name
  compact?: boolean;
  // Shown as chips above the search, when they are in the list of this data type
  favorites?: CRS[];
  recent?: CRS[];
}

const { geodeObjectType, compact = false, favorites = [], recent = [] } = defineProps<Props>();
const selectedCrs = defineModel<CRS | undefined>();
const emit = defineEmits<{ "toggle-favorite": [crs: CRS] }>();
// The star column is only shown to a parent that keeps the favorites
const canToggleFavorite = getCurrentInstance()?.vnode.props?.onToggleFavorite !== undefined;

const search = ref<string>("");
const data_table_loading = ref<boolean>(false);
// Thousands of rows that are never mutated: no deep reactivity
const crs_list = shallowRef<CRS[]>([]);
const toggle_loading = useToggle(data_table_loading);
const crsStore = useCrsStore();

// Codes are only unique within an authority (e.g. EPSG:4812 and ESRI:4812)
function crs_key(crs: CRS): string {
  return `${crs.authority}:${crs.code}`;
}

// A click on the row selects it: no checkbox column. Enter does the same once the row is focused
function select_crs(crs: CRS): void {
  selectedCrs.value = crs;
}

// Vuetify passes the click event first, then the clicked row
function on_row_click(_event: Event, { item }: { item: CRS }): void {
  select_crs(item);
}

function row_props({ item }: { item: CRS }): Record<string, unknown> {
  const selected = selectedCrs.value !== undefined && crs_key(item) === crs_key(selectedCrs.value);
  return {
    class: ["crs-row", { "bg-primary": selected }],
    tabindex: 0,
    "aria-selected": selected,
    onKeydown: (event: KeyboardEvent): void => {
      if (event.key === "Enter") {
        select_crs(item);
      }
    },
  };
}

const listed_crs = computed(() => new Map(crs_list.value.map((crs) => [crs_key(crs), crs])));
const favorite_keys = computed(() => new Set(favorites.map((crs) => crs_key(crs))));

// The CRS of the list, not the given ones: a favorite of another data type is left out
function listed(shortlist: CRS[]): CRS[] {
  return shortlist.flatMap((crs) => listed_crs.value.get(crs_key(crs)) ?? []);
}

const favorite_chips = computed(() => listed(favorites));
const recent_chips = computed(() => listed(recent));

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

const favorite_header = { title: "", key: "favorite", sortable: false, width: 48 } as const;

const headers = computed(() => {
  const base = compact ? compact_headers : full_headers;
  if (!canToggleFavorite) {
    return base;
  }
  return [favorite_header, ...base];
});

// Not awaited in setup: the table renders right away with its loader
onMounted(async () => {
  await get_crs_table();
});
</script>

<template>
  <div
    v-if="favorite_chips.length > 0 || recent_chips.length > 0"
    class="d-flex flex-wrap ga-2 mb-2"
  >
    <v-chip
      v-for="crs in favorite_chips"
      :key="`favorite-${crs_key(crs)}`"
      data-testid="crsFavoriteChip"
      prepend-icon="ph-star-fill"
      size="small"
      @click="select_crs(crs)"
    >
      {{ crs_key(crs) }}
      <v-tooltip activator="parent" :text="crs.name" location="top" />
    </v-chip>
    <v-chip
      v-for="crs in recent_chips"
      :key="`recent-${crs_key(crs)}`"
      data-testid="crsRecentChip"
      prepend-icon="ph-clock-counter-clockwise"
      size="small"
      variant="outlined"
      @click="select_crs(crs)"
    >
      {{ crs_key(crs) }}
      <v-tooltip activator="parent" :text="crs.name" location="top" />
    </v-chip>
  </div>
  <v-text-field
    v-model="search"
    data-testid="crsSearchInput"
    :append-icon="compact ? undefined : 'ph-magnifying-glass'"
    :prepend-inner-icon="compact ? 'ph-magnifying-glass' : undefined"
    label="Search"
    single-line
    hide-details
  ></v-text-field>
  <v-data-table
    :items-per-page="10"
    :items-per-page-options="items_per_page_options"
    :headers="headers"
    :items="crs_list"
    :item-value="crs_key"
    class="elevation-1"
    density="compact"
    fixed-header
    :row-props="row_props"
    :search="search"
    :loading="data_table_loading"
    loading-text="Loading... Please wait"
    @click:row="on_row_click"
  >
    <template #[`item.favorite`]="{ item }">
      <v-btn
        data-testid="crsFavoriteToggle"
        :icon="favorite_keys.has(crs_key(item)) ? 'ph-star-fill' : 'ph-star'"
        :aria-label="
          favorite_keys.has(crs_key(item)) ? 'Remove from favorites' : 'Add to favorites'
        "
        variant="text"
        size="x-small"
        @click.stop="emit('toggle-favorite', item)"
      />
    </template>
    <template v-if="compact" #[`item.name`]="{ value }">
      <v-tooltip :text="value" location="top">
        <template #activator="{ props: tooltipProps }">
          <span v-bind="tooltipProps">{{ value }}</span>
        </template>
      </v-tooltip>
    </template>
  </v-data-table>
</template>

<style scoped>
:deep(.crs-row) {
  cursor: pointer;
}
</style>
