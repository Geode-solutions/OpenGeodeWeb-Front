<script setup>
import FetchingData from "@ogw_front/components/FetchingData.vue";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeFilter } from "@ogw_front/composables/use_tree_filter";
import { useTreeviewStore } from "@ogw_front/stores/treeview";
const LOADER_DELAY_MS = 50;

const { id: viewId } = defineProps({ id: { type: String, required: true } });
const emit = defineEmits(["show-menu"]);

const dataStore = useDataStore();
const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const treeviewStore = useTreeviewStore();

const currentView = computed(() =>
  treeviewStore.opened_views.find((view) => view.id === viewId),
);
const opened = computed({
  get: () => currentView.value?.opened || [],
  set: (value) => treeviewStore.setOpened(viewId, value),
});

const items = dataStore.refFormatedMeshComponents(viewId);

const localItems = ref([]);

function sortItems(itemList) {
  const field = sortType.value === "name" ? "title" : "id";
  const options = { numeric: true, sensitivity: "base" };
  return itemList.toSorted((itemA, itemB) => {
    const titleA = String(itemA[field] || itemA.id || "");
    const titleB = String(itemB[field] || itemB.id || "");
    return titleA.localeCompare(titleB, undefined, options);
  });
}

watch(
  items,
  (newItems) => {
    if (!newItems) {
      localItems.value = [];
      return;
    }
    localItems.value = newItems.map((newCategory) => {
      const existing = localItems.value.find(
        (category) => category.id === newCategory.id,
      );
      if (existing) {
        existing.title = newCategory.title || newCategory.id;
        return existing;
      }
      return reactive({
        ...newCategory,
        title: newCategory.title || newCategory.id,
        children: [],
        manualChildren: [],
      });
    });
  },
  { immediate: true },
);

const displayItems = localItems;

const mesh_components_selection = dataStyleStore.visibleMeshComponents(viewId);

const {
  search,
  sortType,
  filterOptions,
  processedItems,
  availableFilterOptions,
  toggleSort,
  customFilter,
} = useTreeFilter(displayItems);

function restoreManualState() {
  for (const category of localItems.value) {
    category.children = category.manualChildren || [];
  }
}

function saveManualState() {
  for (const category of localItems.value) {
    category.manualChildren = [...category.children];
  }
}

async function performGlobalSearch(query) {
  const allComponents = await dataStore.getAllMeshComponents(viewId);
  const searchMatch = query.toLowerCase();
  const matches = allComponents.filter(
    (component) =>
      component.title.toLowerCase().includes(searchMatch) ||
      component.id.toLowerCase().includes(searchMatch),
  );

  const byType = {};
  for (const match of matches) {
    if (!byType[match.category]) {
      byType[match.category] = [];
    }
    byType[match.category].push(match);
  }

  for (const type of Object.keys(byType)) {
    byType[type] = sortItems(byType[type]);
  }

  for (const category of localItems.value) {
    category.children = byType[category.id] || [];
  }

  const idsToOpen = Object.keys(byType).filter(
    (type) => byType[type].length > 0,
  );
  if (idsToOpen.length > 0) {
    opened.value = [...new Set([...opened.value, ...idsToOpen])];
  }
}

watch(search, async (newSearch, oldSearch) => {
  if (!newSearch) {
    restoreManualState();
    return;
  }

  if (!oldSearch) {
    saveManualState();
  }

  await performGlobalSearch(newSearch);
});

watch(opened, (newOpened, oldOpened) => {
  if (search.value) {
    return;
  }
  const closed = oldOpened.filter((itemId) => !newOpened.includes(itemId));
  for (const itemId of closed) {
    const category = localItems.value.find(
      (existingCategory) => existingCategory.id === itemId,
    );
    if (category) {
      category.children = [];
      category.manualChildren = [];
    }
  }
});

async function loadChildren(item) {
  if (search.value) {
    return;
  }
  const target = localItems.value.find((category) => category.id === item.id);
  if (!target) {
    return;
  }

  // oxlint-disable-next-line promise/avoid-new
  await new Promise((resolve) => {
    setTimeout(resolve, LOADER_DELAY_MS);
  });
  const children = await dataStore.getMeshComponentsByType(viewId, target.id);
  target.children = sortItems(children);
  target.manualChildren = [...target.children];
}

async function onSelectionChange(current) {
  const previous = mesh_components_selection.value;
  const { added, removed } = compareSelections(current, previous);

  if (added.length === 0 && removed.length === 0) {
    return;
  }

  if (added.length > 0) {
    await dataStyleStore.setModelComponentsVisibility(viewId, added, true);
  }
  if (removed.length > 0) {
    await dataStyleStore.setModelComponentsVisibility(viewId, removed, false);
  }
  hybridViewerStore.remoteRender();
}

function showContextMenu(event, item) {
  const actualItem = item.raw || item;
  emit("show-menu", {
    event,
    itemId: actualItem.category ? actualItem.id : viewId,
    context_type: actualItem.category
      ? "model_component"
      : "model_component_type",
    modelId: viewId,
    modelComponentType: actualItem.category ? undefined : actualItem.id,
  });
}
</script>

<template>
  <div class="tree-view-container">
    <ObjectTreeControls
      v-model:search="search"
      :sort-type="sortType"
      :filter-options="filterOptions"
      :available-filter-options="availableFilterOptions"
      @toggle-sort="toggleSort"
    />

    <FetchingData v-if="items === undefined" :size="48" :width="4" text="" />

    <v-treeview
      v-else
      :selected="mesh_components_selection"
      v-model:opened="opened"
      :items="processedItems"
      :search="search"
      :custom-filter="customFilter"
      :load-children="loadChildren"
      class="transparent-treeview"
      item-value="id"
      select-strategy="independent"
      selectable
      items-registration="props"
      @update:selected="onSelectionChange"
    >
      <template #title="{ item }">
        <ObjectTreeItemLabel
          :item="item"
          show-tooltip
          @contextmenu="showContextMenu($event, item)"
        />
      </template>
    </v-treeview>
  </div>
</template>

<style scoped>
.transparent-treeview {
  background-color: transparent;
  margin: 4px 0;
}

:deep(.v-list-item) {
  transition: background-color 0.2s ease;
}

:deep(.v-list-item--active > .v-list-item__overlay) {
  opacity: 0 !important;
}

:deep(.v-list-item:hover > .v-list-item__overlay) {
  opacity: 0.1 !important;
}
</style>
