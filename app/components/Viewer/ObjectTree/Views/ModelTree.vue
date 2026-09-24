<script setup lang="ts">
import { sortAndFormatItems, useTreeFilter } from "@ogw_front/composables/tree_filter";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import FetchingData from "@ogw_front/components/FetchingData.vue";
import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { useHoverhighlight } from "@ogw_front/composables/hover_highlight";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelCollections } from "@ogw_front/composables/model_collections";
import { useModelComponents } from "@ogw_front/composables/model_components";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

interface Props {
  id: string;
  viewId?: string;
  viewType?: string;
}

const { id, viewId = undefined, viewType = "model_components" } = defineProps<Props>();
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
interface Emits {
  "show-menu": [
    payload: {
      event: unknown;
      itemId: string;
      context_type: "model_component" | "model_component_type";
      modelId: string;
      modelComponentType?: string;
      targetComponentIds?: string[];
    },
  ];
}

const emit = defineEmits<Emits>();

const treeviewStore = useTreeviewStore();

const isCollections = computed(() => viewType === "model_collections");

const composable = isCollections.value ? useModelCollections(id) : useModelComponents(id);
const {
  items: rawItems,
  localCategories,
  selection: visibleComponents,
  updateVisibility,
} = composable;

const cache = computed(
  () =>
    ("componentsCache" in composable ? composable.componentsCache.value : undefined) ??
    ("collectionsCache" in composable ? composable.collectionsCache.value : undefined),
);

const currentView = computed(() =>
  treeviewStore.opened_views.find((view) => view.id === actualViewId),
);

const opened = computed<string[]>({
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

function onUpdateSelection(newSelection: string[]): void {
  const finalSelection = applySearchFilter(newSelection, visibleComponents.value);
  updateVisibility(finalSelection as string[]);
}

const visibleSelection = computed<string[]>(
  () => applySearchFilter(visibleComponents.value, []) as string[],
);

const itemsForTreeView = computed<CollectionTreeItem[]>(() => {
  if (search.value && cache.value) {
    const query = search.value.toLowerCase();
    const result: CollectionTreeItem[] = [];
    for (const type of Object.keys(cache.value)) {
      const matches = (cache.value[type] ?? []).filter(
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
        cache.value?.[categoryId],
        sortType.value,
      ) as unknown as CollectionTreeItem[],
    });
  }
  return result;
});

function extractComponentIds(node: CollectionTreeItem): string[] {
  if (node.children) {
    return node.children.flatMap((child) => extractComponentIds(child));
  }
  return [node.id];
}

function showContextMenu(event: unknown, item: CollectionTreeItem): void {
  const actualItem = item.raw || item;
  if (isCollections.value && !MESH_COMPONENT_TYPES.includes(actualItem.category ?? "")) {
    emit("show-menu", {
      event,
      itemId: id,
      context_type: "model_component_type",
      modelId: id,
      modelComponentType: actualItem.category ?? actualItem.id,
      targetComponentIds: extractComponentIds(actualItem),
    });
    return;
  }
  const typeId = actualItem.category || actualItem.id;
  const typeItem = itemsForTreeView.value.find((type) => type.id === typeId);
  const targetComponentIds = typeItem?.children?.map((child) => child.id);
  emit("show-menu", {
    event,
    itemId: actualItem.category ? actualItem.id : id,
    context_type: actualItem.category ? "model_component" : "model_component_type",
    modelId: id,
    modelComponentType: actualItem.category ? undefined : actualItem.id,
    targetComponentIds,
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
}): void {
  const actualItem = item.raw || item;

  if (!actualItem.category && (!actualItem.children || actualItem.children.length === 0)) {
    return;
  }

  const viewerIdsToHover = extractIds(actualItem);
  onHoverEnter(id, () => viewerIdsToHover, "model", immediate);
}

function handleHoverLeave(): void {
  onHoverLeave(id);
}

function expandAll(): void {
  const allIds: string[] = [];
  function traverse(itemsList: CollectionTreeItem[]): void {
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

function getLeafViewerIds(item: CollectionTreeItem): number[] {
  const actualItem = item.raw || item;
  return extractIds(actualItem);
}

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
      @update:selected="(val) => onUpdateSelection(val as string[])"
      @click:item="onUpdateSelection([$event.id as string, ...visibleComponents])"
      @update:scroll-top="treeviewStore.setScrollTop(actualViewId, $event)"
      @hover:enter="({ item }) => handleHoverEnter({ item: item as unknown as CollectionTreeItem })"
      @hover:leave="handleHoverLeave"
      @contextmenu="showContextMenu($event.event, $event.item as unknown as CollectionTreeItem)"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item as unknown as DisplayItem"
          :is-leaf="isLeaf"
          show-tooltip
          class="text-body-1"
          @contextmenu="showContextMenu($event, item as unknown as CollectionTreeItem)"
        />
      </template>

      <template #append="{ item }">
        <v-btn
          v-if="getLeafViewerIds(item as unknown as CollectionTreeItem).length > 0"
          icon="mdi-target"
          size="medium"
          variant="text"
          v-tooltip="'Focus camera on object'"
          @click.stop="
            hybridViewerStore.focusCameraOnObject(
              id,
              getLeafViewerIdsForFocus(item as unknown as CollectionTreeItem),
            )
          "
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
