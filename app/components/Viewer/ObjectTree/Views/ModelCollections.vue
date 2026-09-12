<script setup lang="ts">
import { sortAndFormatItems, useTreeFilter } from "@ogw_front/composables/tree_filter";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import FetchingData from "@ogw_front/components/FetchingData.vue";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { useHoverhighlight } from "@ogw_front/composables/hover_highlight";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelCollections } from "@ogw_front/composables/model_collections";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

// oxlint-disable-next-line vue/define-props-declaration
const { id, viewId } = defineProps({
  id: { type: String, required: true },
  viewId: { type: String, required: false, default: undefined },
});
const actualViewId = viewId || id;

interface CollectionTreeItem {
  raw?: CollectionTreeItem;
  id: string;
  category?: string;
  children?: CollectionTreeItem[];
  viewer_id?: number;
  title?: string;
}

const { onHoverEnter, onHoverLeave } = useHoverhighlight();
const hybridViewerStore = useHybridViewerStore();
// oxlint-disable-next-line vue/define-emits-declaration
const emit = defineEmits(["show-menu"]);

const treeviewStore = useTreeviewStore();
const {
  items: rawItems,
  collectionsCache: componentsCache,
  localCategories,
  selection: visibleComponents,
  updateVisibility,
} = useModelCollections(id);

const currentView = computed(() =>
  treeviewStore.opened_views.find((view) => view.id === actualViewId),
);

const opened = computed({
  get: () => currentView.value?.opened || [],
  set: (val) => treeviewStore.setOpened(actualViewId, val),
});

const {
  search,
  sortType,
  filterOptions,
  processedItems: filteredCategories,
  availableFilterOptions,
  toggleSort,
  customFilter,
  applySearchFilter,
} = useTreeFilter(localCategories);

function onUpdateSelection(newSelection: string[]) {
  const finalSelection = applySearchFilter(newSelection, visibleComponents.value);
  updateVisibility(finalSelection as string[]);
}

const visibleSelection = computed(() => applySearchFilter(visibleComponents.value, []));

const itemsForTreeView = computed<CollectionTreeItem[]>(() => {
  if (search.value && componentsCache.value) {
    const query = search.value.toLowerCase();
    const result: CollectionTreeItem[] = [];
    for (const type of Object.keys(componentsCache.value)) {
      const matches = (componentsCache.value[type] ?? []).filter(
        (component: { title: string; id: string }) =>
          component.title.toLowerCase().includes(query) ||
          component.id.toLowerCase().includes(query),
      );
      if (matches.length > 0) {
        result.push({
          id: type,
          title: `${type}s (${matches.length})`,
          children: sortAndFormatItems(matches, sortType.value) as unknown as CollectionTreeItem[],
        });
      }
    }
    return result;
  }

  const result: CollectionTreeItem[] = [];
  for (const category of filteredCategories.value) {
    const categoryId = category.id as string;
    result.push({
      ...category,
      id: categoryId,
      children: sortAndFormatItems(
        componentsCache.value?.[categoryId],
        sortType.value,
      ) as unknown as CollectionTreeItem[],
    });
  }
  return result;
});

function showContextMenu(event: unknown, item: CollectionTreeItem) {
  const actualItem = item.raw || item;
  emit("show-menu", {
    event,
    itemId: actualItem.category ? actualItem.id : id,
    context_type: actualItem.category ? "model_component" : "model_component_type",
    modelId: id,
    modelComponentType: actualItem.category ? undefined : actualItem.id,
  });
}

function extractIds(node: CollectionTreeItem): number[] {
  if (node.children) {
    return node.children.flatMap((child) => extractIds(child));
  }
  if (Number.isInteger(node.viewer_id)) {
    return [node.viewer_id as number];
  }
  return [];
}

function handleHoverEnter({
  item,
  immediate = false,
}: {
  item: CollectionTreeItem;
  immediate?: boolean;
}) {
  const actualItem = item.raw || item;

  if (!actualItem.category && (!actualItem.children || actualItem.children.length === 0)) {
    return;
  }

  const viewerIdsToHover = extractIds(actualItem);

  onHoverEnter(id, () => viewerIdsToHover, "model", immediate);
}

function handleHoverLeave() {
  onHoverLeave(id);
}

function expandAll() {
  const allIds: string[] = [];
  function traverse(itemsList: CollectionTreeItem[]) {
    for (const item of itemsList) {
      if (item.children && item.children.length > 0) {
        allIds.push(item.id);
        traverse(item.children);
      }
    }
  }
  traverse(itemsForTreeView.value);
  opened.value = allIds;
}

function getLeafViewerIds(item: CollectionTreeItem) {
  const actualItem = item.raw || item;
  return extractIds(actualItem);
}

// The focusCameraOnObject composable's block_ids parameter is declared as string[], but this view (like the sibling ModelComponents view) has always focused the camera using the numeric viewer/actor ids collected by extractIds; that pre-dates this typing pass, so the ids are passed through as-is (no Number/String conversion) rather than changed here.
function getLeafViewerIdsForFocus(item: CollectionTreeItem): string[] {
  return getLeafViewerIds(item) as unknown as string[];
}
</script>

<template>
  <div class="tree-view-container">
    <ObjectTreeControls
      v-model:search="search"
      :sort-type="sortType"
      :filter-options="filterOptions"
      :available-filter-options="availableFilterOptions"
      :is-collapsed="opened.length === 0"
      @toggle-sort="toggleSort"
      @collapse-all="opened = []"
      @expand-all="expandAll"
    />

    <FetchingData v-if="rawItems === undefined" :size="48" :width="4" text="" />

    <CommonTreeView
      :selected="visibleSelection"
      v-model:opened="opened"
      v-model:active="treeviewStore.activeItems"
      :items="itemsForTreeView"
      :options="{
        selection: { selectable: true, strategy: 'classic' },
        search,
        customFilter,
      }"
      :scroll-top="currentView?.scrollTop || 0"
      class="transparent-treeview virtual-tree-height"
      @update:selected="onUpdateSelection"
      @click:item="onUpdateSelection([$event.id, ...visibleComponents])"
      @update:scroll-top="treeviewStore.setScrollTop(actualViewId, $event)"
      @hover:enter="handleHoverEnter"
      @hover:leave="handleHoverLeave"
      @contextmenu="showContextMenu($event.event, $event.item)"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item"
          :is-leaf="isLeaf"
          show-tooltip
          class="text-body-1"
          @contextmenu="showContextMenu($event, item)"
        />
      </template>

      <template #append="{ item }">
        <v-btn
          v-if="getLeafViewerIds(item).length > 0"
          icon="mdi-target"
          size="medium"
          variant="text"
          v-tooltip="'Focus camera on object'"
          @click.stop="hybridViewerStore.focusCameraOnObject(id, getLeafViewerIdsForFocus(item))"
        />
      </template>
    </CommonTreeView>
  </div>
</template>

<style scoped>
.tree-view-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.virtual-tree-height {
  flex-grow: 1;
  min-height: 0;
}

.transparent-treeview {
  background-color: transparent;
}

:deep(.v-list-item__overlay) {
  display: none !important;
}
</style>
