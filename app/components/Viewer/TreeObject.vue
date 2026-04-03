<script setup>
import ActionButton from "@ogw_front/components/ActionButton.vue";
import SearchBar from "@ogw_front/components/SearchBar.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

import { compareSelections } from "@ogw_front/utils/treeview";

const treeviewStore = useTreeviewStore();
const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const emit = defineEmits(["show-menu"]);

const search = ref("");
const sortType = ref("name");
const filterOptions = ref({});

const processedItems = computed(() =>
  treeviewStore.items
    .filter((category) => filterOptions.value[category.title] !== false)
    .map((category) => {
      const field = sortType.value === "name" ? "title" : "id";
      const children = (category.children || []).toSorted((first, second) =>
        first[field].localeCompare(second[field], undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      );
      return { id: category.title, title: category.title, children };
    }),
);

const availableFilterOptions = computed(() =>
  treeviewStore.items.map((category) => category.title),
);

watch(
  availableFilterOptions,
  (newOptions) => {
    for (const option of newOptions) {
      if (filterOptions.value[option] === undefined) {
        filterOptions.value[option] = true;
      }
    }
  },
  { immediate: true },
);

function toggleSort() {
  sortType.value = sortType.value === "name" ? "id" : "name";
}

function customFilter(value, searchQuery, item) {
  if (!searchQuery) {
    return true;
  }
  const query = searchQuery.toLowerCase();
  return (
    item.raw.title.toLowerCase().includes(query) ||
    (item.raw.id && item.raw.id.toLowerCase().includes(query))
  );
}

function isLeafNode(item) {
  return !item.children || item.children.length === 0;
}

watch(
  () => treeviewStore.selection,
  async (current, previous) => {
    const oldSelection = previous || [];
    if (current === oldSelection) {
      return;
    }
    const { added, removed } = compareSelections(current, previous);
    const updates = [
      ...added.map((id) => dataStyleStore.setVisibility(id, true)),
      ...removed.map((id) => dataStyleStore.setVisibility(id, false)),
    ];
    await Promise.all(updates);
    hybridViewerStore.remoteRender();
  },
);

function isModel(item) {
  return item.viewer_type === "model";
}

onMounted(() => {
  const savedSelection = treeviewStore.selection;
  if (savedSelection && savedSelection.length > 0) {
    treeviewStore.selection = savedSelection;
  }
});
</script>

<template>
  <v-row v-if="treeviewStore.items.length > 0" dense align="center" class="mr-1 ml-3 mt-2 pa-1">
    <v-col>
      <SearchBar v-model="search" label="Search" color="black" base-color="black" />
    </v-col>
    <v-col cols="auto" class="d-flex align-center">
      <ActionButton
        :tooltip="'Sort by ' + (sortType === 'name' ? 'ID' : 'Name')"
        :icon="
          sortType === 'name' ? 'mdi-sort-alphabetical-ascending' : 'mdi-sort-numeric-ascending'
        "
        tooltipLocation="bottom"
        @click="toggleSort"
      />
      <v-menu :close-on-content-click="false">
        <template #activator="{ props }">
          <ActionButton
            tooltip="Filter options"
            icon="mdi-filter-variant"
            tooltipLocation="bottom"
            class="ml-1"
            v-bind="props"
          />
        </template>
        <v-list class="mt-1">
          <v-list-item v-for="category_id in availableFilterOptions" :key="category_id">
            <v-checkbox
              v-model="filterOptions[category_id]"
              :label="category_id"
              hide-details
              density="compact"
            />
          </v-list-item>
        </v-list>
      </v-menu>
    </v-col>
  </v-row>
  <v-treeview
    v-model:selected="treeviewStore.selection"
    :items="processedItems"
    :search="search"
    :custom-filter="customFilter"
    class="transparent-treeview"
    item-value="id"
    select-strategy="classic"
    selectable
  >
    <template #title="{ item }">
      <span
        class="treeview-item"
        @contextmenu.prevent.stop="
          isLeafNode(item) ? emit('show-menu', { event: $event, itemId: item.id }) : null
        "
      >
        {{ item.title }}
      </span>
    </template>

    <template #append="{ item }">
      <v-btn
        v-if="isModel(item)"
        icon="mdi-magnify-expand"
        size="medium"
        class="ml-8"
        variant="text"
        v-tooltip="'Model\'s mesh components'"
        @click.stop="treeviewStore.displayAdditionalTree(item.id)"
      />
    </template>
  </v-treeview>
</template>

<style scoped>
.transparent-treeview {
  background-color: transparent;
  margin: 4px 0;
}

.treeview-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: inline-block;
}
</style>
