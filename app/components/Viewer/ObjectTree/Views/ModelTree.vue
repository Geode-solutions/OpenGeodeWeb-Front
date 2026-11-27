<script setup lang="ts">
// oxlint-disable import/max-dependencies -- the model tree view wires the tree filter, the hover highlight, the viewer and the treeview store
import type { ModelComponentId, ModelId, TreeNodeId } from "@ogw_front/types/identifiers";
import type { ModelTreeItem, TreeRowHoverPayload } from "@ogw_front/types/props/viewer/object_tree";
import { sortAndFormatItems, useTreeFilter } from "@ogw_front/composables/tree_filter";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import FetchingData from "@ogw_front/components/FetchingData.vue";
import type { ModelComponentMenuPayload } from "@ogw_front/utils/treeview";
import type { ModelComponentType } from "@ogw_front/types/model";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import type { SearchQuery } from "@ogw_front/types/ui";
import type { ViewerId } from "@geode/opengeodeweb-viewer/schema_types";
import { useDataStore } from "@ogw_front/stores/data";
import { useHoverhighlight } from "@ogw_front/composables/hover_highlight";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelTree } from "@ogw_front/composables/model_tree";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

interface Props {
  id: ModelId;
}

interface Emits {
  "show-menu": [payload: ModelComponentMenuPayload];
}

const { id } = defineProps<Props>();

const { onHoverEnter, onHoverLeave } = useHoverhighlight();
const hybridViewerStore = useHybridViewerStore();
const emit = defineEmits<Emits>();

const treeviewStore = useTreeviewStore();
const dataStore = useDataStore();

const {
  isLoading,
  localCategories,
  cache,
  collectionTypes,
  withRelations,
  selection: visibleComponents,
  updateVisibility,
} = useModelTree(id);

const currentView = computed(() => treeviewStore.opened_views.find((view) => view.id === id));

const opened = computed<TreeNodeId[]>({
  get: () => currentView.value?.opened || [],
  set: (val) => treeviewStore.setOpened(id, val),
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

function onUpdateSelection(newSelection: ModelComponentId[]): void {
  const finalSelection = applySearchFilter(newSelection, visibleComponents.value);
  updateVisibility(finalSelection);
}

const visibleSelection = computed<ModelComponentId[]>(() =>
  applySearchFilter(visibleComponents.value, []),
);

function matchesSearch(item: ModelTreeItem, query: SearchQuery): boolean {
  return (
    (item.title ?? "").toLowerCase().includes(query) ||
    item.id.toLowerCase().includes(query) ||
    (item.children ?? []).some((child) => matchesSearch(child, query))
  );
}

function searchGroups(query: SearchQuery): ModelTreeItem[] {
  const groups = (cache.value ?? {}) as Record<ModelComponentType, ModelTreeItem[]>;
  const result: ModelTreeItem[] = [];
  for (const [type, components] of Object.entries(groups)) {
    const matches = components.filter((component) => matchesSearch(component, query));
    if (matches.length > 0) {
      result.push({
        id: type,
        title: `${type}s (${matches.length})`,
        children: sortAndFormatItems(matches, sortType.value) as unknown as ModelTreeItem[],
      });
    }
  }
  return result;
}

const itemsForTreeView = computed<ModelTreeItem[]>(() => {
  if (search.value) {
    const query = search.value.toLowerCase();
    return sortAndFormatItems(searchGroups(query), sortType.value) as unknown as ModelTreeItem[];
  }

  const result: ModelTreeItem[] = [];
  for (const category of filteredCategories.value) {
    const categoryId = category.id as ModelComponentType;
    result.push({
      ...category,
      id: categoryId,
      children: withRelations(
        categoryId,
        sortAndFormatItems(cache.value?.[categoryId], sortType.value) as ModelTreeItem[],
        sortType.value,
      ),
    });
  }
  return result;
});

function extractComponentIds(node: ModelTreeItem): ModelComponentId[] {
  if (node.children) {
    return node.children.flatMap((child) => extractComponentIds(child));
  }
  return [node.id];
}

function isCollectionNode(item: ModelTreeItem): boolean {
  return collectionTypes.value.has(item.category ?? item.id);
}

function showContextMenu(event: MouseEvent, item: ModelTreeItem): void {
  const actualItem = item.raw || item;
  // A boundaries or internals group is not a component type: it has no menu
  if (actualItem.relation !== undefined) {
    return;
  }
  if (isCollectionNode(actualItem)) {
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

function extractIds(node: ModelTreeItem): ViewerId[] {
  if (node.children) {
    return node.children.flatMap((child) => extractIds(child));
  }
  if (Number.isInteger(node.viewer_id)) {
    return [node.viewer_id as ViewerId];
  }
  return [];
}

function handleHoverEnter({ item, immediate = false }: TreeRowHoverPayload<ModelTreeItem>): void {
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
  const allIds: TreeNodeId[] = [];
  function traverse(itemsList: ModelTreeItem[]): void {
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

function getLeafViewerIds(item: ModelTreeItem): ViewerId[] {
  const actualItem = item.raw || item;
  return extractIds(actualItem);
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

    <FetchingData v-if="isLoading" :size="48" :width="4" text="" />

    <CommonTreeView
      v-else
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
      :is-row-viewable="() => dataStore.isViewable(id)"
      @update:selected="(val) => onUpdateSelection(val as ModelComponentId[])"
      @update:scroll-top="treeviewStore.setScrollTop(id, $event)"
      @hover:enter="
        ({ item, immediate }) =>
          handleHoverEnter({ item: item as unknown as ModelTreeItem, immediate })
      "
      @hover:leave="handleHoverLeave"
      @contextmenu="showContextMenu($event.event, $event.item as unknown as ModelTreeItem)"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item as unknown as DisplayItem"
          :is-leaf="isLeaf"
          :model-id="id"
          show-tooltip
          class="text-body-1"
          @contextmenu="showContextMenu($event, item as unknown as ModelTreeItem)"
        />
      </template>

      <template #append="{ item }">
        <v-btn
          v-if="getLeafViewerIds(item as unknown as ModelTreeItem).length > 0"
          icon="ph-target"
          size="medium"
          variant="text"
          v-tooltip="'Focus camera on object'"
          @click.stop="
            hybridViewerStore.focusCameraOnObject(
              id,
              getLeafViewerIds(item as unknown as ModelTreeItem),
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
