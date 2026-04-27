<script setup>
import { sortAndFormatItems, useTreeFilter } from "@ogw_front/composables/use_tree_filter";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import FetchingData from "@ogw_front/components/FetchingData.vue";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { useHoverhighlight } from "@ogw_front/composables/use_hover_highlight";
import { useModelComponents } from "@ogw_front/composables/use_model_components";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const { id } = defineProps({ id: { type: String, required: true } });
const { onHoverEnter, onHoverLeave } = useHoverhighlight();
const emit = defineEmits(["show-menu"]);

const treeviewStore = useTreeviewStore();
const {
  items: rawItems,
  componentsCache,
  localCategories,
  selection: visibleComponents,
  updateVisibility,
} = useModelComponents(id);

const currentView = computed(() => treeviewStore.opened_views.find((view) => view.id === id));

const opened = computed({
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

function onUpdateSelection(newSelection) {
  const finalSelection = applySearchFilter(newSelection, visibleComponents.value);
  updateVisibility(finalSelection);
}

const visibleSelection = computed(() => applySearchFilter(visibleComponents.value, []));

const itemsForTreeView = computed(() => {
  if (search.value && componentsCache.value) {
    const query = search.value.toLowerCase();
    const result = [];
    for (const type of Object.keys(componentsCache.value)) {
      const matches = componentsCache.value[type].filter(
        (component) =>
          component.title.toLowerCase().includes(query) ||
          component.id.toLowerCase().includes(query),
      );
      if (matches.length > 0) {
        result.push({
          id: type,
          title: `${type}s (${matches.length})`,
          children: sortAndFormatItems(matches, sortType.value),
        });
      }
    }
    return result;
  }

  const result = [];
  for (const category of filteredCategories.value) {
    result.push({
      ...category,
      children: sortAndFormatItems(
        componentsCache.value?.[category.id],
        sortType.value,
      ),
    });
  }
  return result;
});

function showContextMenu(event, item) {
  const actualItem = item.raw || item;
  emit("show-menu", {
    event,
    itemId: actualItem.category ? actualItem.id : id,
    context_type: actualItem.category ? "model_component" : "model_component_type",
    modelId: id,
    modelComponentType: actualItem.category ? undefined : actualItem.id,
  });
}

function handleHoverEnter({ item, immediate = false }) {
  const actualItem = item.raw || item;

  if (!actualItem.category && (!actualItem.children || actualItem.children.length === 0)) {
    return;
  }

  onHoverEnter(
    id,
    () =>
      actualItem.category
        ? [actualItem.viewer_id]
        : actualItem.children?.map((child) => child.viewer_id) || [],
    "model",
    immediate,
  );
}

function handleHoverLeave() {
  onHoverLeave(id);
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
      @collapse-all="opened = []"
    />

    <FetchingData v-if="rawItems === undefined" :size="48" :width="4" text="" />

    <CommonTreeView
      :selected="visibleSelection"
      v-model:opened="opened"
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
      @update:scroll-top="treeviewStore.setScrollTop(id, $event)"
      @hover:enter="handleHoverEnter"
      @hover:leave="handleHoverLeave"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item"
          :is-leaf="isLeaf"
          show-tooltip
          class="text-body-1"
          @contextmenu.prevent.stop="showContextMenu($event, item)"
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
