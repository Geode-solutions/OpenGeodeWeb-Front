<script setup>
import FetchingData from "@ogw_front/components/FetchingData.vue";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHoverhighlight } from "@ogw_front/composables/use_hover_highlight";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeFilter } from "@ogw_front/composables/use_tree_filter";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const { id: viewId } = defineProps({ id: { type: String, required: true } });
const { onHoverEnter, onHoverLeave } = useHoverhighlight();
const emit = defineEmits(["show-menu"]);

const dataStore = useDataStore();
const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const treeviewStore = useTreeviewStore();

const currentView = computed(() => treeviewStore.opened_views.find((view) => view.id === viewId));
const opened = computed({
  get: () => currentView.value?.opened || [],
  set: (val) => treeviewStore.setOpened(viewId, val),
});

const items = dataStore.refFormatedMeshComponents(viewId);
const mesh_components_selection = dataStyleStore.visibleMeshComponents(viewId);

const {
  search,
  sortType,
  filterOptions,
  processedItems,
  processedItemIds,
  filteredItemIds,
  availableFilterOptions,
  toggleSort,
  customFilter,
} = useTreeFilter(items);

async function onSelectionChange(newVal) {
  const previous = mesh_components_selection.value;
  const prevVisibleSet = new Set(previous.filter((id) => filteredItemIds.value.has(id)));
  const newValSet = new Set(newVal.filter((id) => filteredItemIds.value.has(id)));

  const added = [...newValSet].filter((id) => !prevVisibleSet.has(id));
  const removed = [...prevVisibleSet].filter((id) => !newValSet.has(id));

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

const filterHiddenCache = new Map();

watch(filteredItemIds, async (newFiltered, oldFiltered) => {
  const prev = oldFiltered ?? new Set();
  const selectionSet = new Set(mesh_components_selection.value);

  const nowHidden = [...prev].filter((id) => !newFiltered.has(id));
  const nowShown = [...newFiltered].filter((id) => !prev.has(id));

  if (nowHidden.length === 0 && nowShown.length === 0) {
    return;
  }

  for (const id of nowHidden) {
    filterHiddenCache.set(id, selectionSet.has(id));
  }

  const toShow = [];
  const toHide = [];
  for (const id of nowShown) {
    const wasVisible = filterHiddenCache.has(id) ? filterHiddenCache.get(id) : selectionSet.has(id);
    filterHiddenCache.delete(id);
    if (wasVisible) {
      toShow.push(id);
    } else {
      toHide.push(id);
    }
  }

  const actualToHide = nowHidden.filter((id) => selectionSet.has(id));

  const promises = [];
  if (actualToHide.length > 0) {
    promises.push(dataStyleStore.setModelComponentsVisibility(viewId, actualToHide, false));
  }
  if (toShow.length > 0) {
    promises.push(dataStyleStore.setModelComponentsVisibility(viewId, toShow, true));
  }
  if (toHide.length > 0) {
    promises.push(dataStyleStore.setModelComponentsVisibility(viewId, toHide, false));
  }
  if (promises.length > 0) {
    await Promise.all(promises);
    hybridViewerStore.remoteRender();
  }
});

function showContextMenu(event, item) {
  const actualItem = item.raw || item;
  emit("show-menu", {
    event,
    itemId: actualItem.category ? actualItem.id : viewId,
    context_type: actualItem.category ? "model_component" : "model_component_type",
    modelId: viewId,
    modelComponentType: actualItem.category ? undefined : actualItem.id,
  });
}

function handleHoverEnter(item) {
  const actualItem = item.raw || item;
  const block_ids = actualItem.category
    ? [actualItem.viewer_id]
    : actualItem.children?.map((child) => child.viewer_id) || [];
  onHoverEnter(viewId, block_ids);
}

function handleHoverLeave() {
  onHoverLeave(viewId);
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
      class="transparent-treeview"
      item-value="id"
      select-strategy="classic"
      selectable
      @update:selected="onSelectionChange"
    >
      <template #title="{ item }">
        <ObjectTreeItemLabel
          :item="item"
          show-tooltip
          @mouseenter="handleHoverEnter(item)"
          @mouseleave="handleHoverLeave(item)"
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
