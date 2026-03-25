<script setup>
import ActionButton from "@ogw_front/components/ActionButton.vue";
import SearchBar from "@ogw_front/components/SearchBar.vue";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();

const { id } = defineProps({ id: { type: String, required: true } });
const emit = defineEmits(["show-menu"]);

const items = dataStore.refFormatedMeshComponents(toRef(() => id));
const mesh_components_selection = dataStyleStore.visibleMeshComponents(toRef(() => id));

const search = ref("");
const sortType = ref("name");
const filterOptions = ref({
  Corner: true,
  Line: true,
  Surface: true,
  Block: true,
});

const processedItems = computed(() =>
  items.value
    .filter((category) => filterOptions.value[category.id])
    .map((category) => {
      const field = sortType.value === "name" ? "title" : "id";
      const children = (category.children || []).toSorted((first, second) =>
        first[field].localeCompare(second[field]),
      );
      return { id: category.id, title: category.title, children };
    }),
);

const availableFilterOptions = computed(() => items.value.map((category) => category.id));

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

function expandCategorySelections(categoryIds, currentSelection, shouldBePresent) {
  const extraIds = [];
  for (const categoryId of categoryIds) {
    const category = items.value.find((cat) => cat.id === categoryId);
    if (category?.children) {
      for (const child of category.children) {
        if (currentSelection.includes(child.id) === shouldBePresent) {
          extraIds.push(child.id);
        }
      }
    }
  }
  return extraIds;
}

async function onSelectionChange(current) {
  const previous = mesh_components_selection.value;
  const { added, removed } = compareSelections(current, previous);

  if (added.length === 0 && removed.length === 0) {
    return;
  }

  const allAdded = [...added, ...expandCategorySelections(added, current, false)];
  const allRemoved = [...removed, ...expandCategorySelections(removed, current, true)];

  if (allAdded.length > 0) {
    await dataStyleStore.setModelMeshComponentsVisibility(id, allAdded, true);
  }
  if (allRemoved.length > 0) {
    await dataStyleStore.setModelMeshComponentsVisibility(id, allRemoved, false);
  }
  hybridViewerStore.remoteRender();
}
</script>

<template>
  <v-row dense align="center" class="mr-1 ml-3 mt-2 pa-1">
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
    :selected="mesh_components_selection"
    :items="processedItems"
    :search="search"
    :custom-filter="customFilter"
    class="transparent-treeview"
    item-value="id"
    select-strategy="independent"
    selectable
    @update:selected="onSelectionChange"
  >
    <template #title="{ item }">
      <span
        class="treeview-item"
        @contextmenu.prevent.stop="emit('show-menu', { event: $event, itemId: item })"
      >
        {{ item.title }}
      </span>
    </template>
  </v-treeview>
</template>

<style scoped>
.treeview-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: inline-block;
}

.transparent-treeview {
  background-color: transparent;
  margin: 4px 0;
}
</style>
