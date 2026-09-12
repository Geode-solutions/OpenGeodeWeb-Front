<script setup lang="ts">
import { sortAndFormatItems, useTreeFilter } from "@ogw_front/composables/tree_filter";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import FetchingData from "@ogw_front/components/FetchingData.vue";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { useHoverhighlight } from "@ogw_front/composables/hover_highlight";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelComponents } from "@ogw_front/composables/model_components";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

// oxlint-disable-next-line vue/define-props-declaration
const { id, viewId } = defineProps({
  id: { type: String, required: true },
  viewId: { type: String, required: false, default: undefined },
});
const actualViewId = viewId || id;

interface TreeViewItem {
  raw?: TreeViewItem;
  id: string;
  category?: string;
  children?: TreeViewItem[];
  viewer_id?: string;
  title?: string;
}

const { onHoverEnter, onHoverLeave } = useHoverhighlight();
const hybridViewerStore = useHybridViewerStore();
// oxlint-disable-next-line vue/define-emits-declaration
const emit = defineEmits(["show-menu"]);

const treeviewStore = useTreeviewStore();
const {
  items: rawItems,
  componentsCache,
  localCategories,
  selection: visibleComponents,
  updateVisibility,
} = useModelComponents(id);

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

const itemsForTreeView = computed<TreeViewItem[]>(() => {
  if (search.value && componentsCache.value) {
    const query = search.value.toLowerCase();
    const result: TreeViewItem[] = [];
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
          children: sortAndFormatItems(matches, sortType.value) as unknown as TreeViewItem[],
        });
      }
    }
    return result;
  }

  const result: TreeViewItem[] = [];
  for (const category of filteredCategories.value) {
    const categoryId = category.id as string;
    result.push({
      ...category,
      id: categoryId,
      children: sortAndFormatItems(
        componentsCache.value?.[categoryId],
        sortType.value,
      ) as unknown as TreeViewItem[],
    });
  }
  return result;
});

function showContextMenu(event: unknown, item: TreeViewItem) {
  const actualItem = item.raw || item;
  const typeId = actualItem.category || actualItem.id;
  const typeItem = itemsForTreeView.value.find((type) => type.id === typeId);
  const targetComponentIds = typeItem
    ? (typeItem.children ?? []).map((child) => child.id)
    : undefined;
  emit("show-menu", {
    event,
    itemId: actualItem.category ? actualItem.id : id,
    context_type: actualItem.category ? "model_component" : "model_component_type",
    modelId: id,
    modelComponentType: actualItem.category ? undefined : actualItem.id,
    targetComponentIds,
  });
}

function handleHoverEnter({
  item,
  immediate = false,
}: {
  item: TreeViewItem;
  immediate?: boolean;
}) {
  const actualItem = item.raw || item;

  if (!actualItem.category && (!actualItem.children || actualItem.children.length === 0)) {
    return;
  }

  onHoverEnter(
    id,
    () =>
      actualItem.category
        ? [Number(actualItem.viewer_id)]
        : (actualItem.children ?? []).map((child) => Number(child.viewer_id)),
    "model",
    immediate,
  );
}

function handleHoverLeave() {
  onHoverLeave(id);
}

function expandAll() {
  const allIds: string[] = [];
  function traverse(itemsList: TreeViewItem[]) {
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
          v-if="item.category || (item.children && item.children.length > 0)"
          icon="mdi-target"
          size="medium"
          variant="text"
          v-tooltip="'Focus camera on object'"
          @click.stop="
            hybridViewerStore.focusCameraOnObject(
              id,
              item.category
                ? [item.viewer_id]
                : item.children.map((child: TreeViewItem) => child.viewer_id),
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
