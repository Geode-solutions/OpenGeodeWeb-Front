<script setup>
import {
  sortAndFormatItems,
  useTreeFilter,
} from "@ogw_front/composables/use_tree_filter";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import FetchingData from "@ogw_front/components/FetchingData.vue";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { useModelComponents } from "@ogw_front/composables/use_model_components";

import { useTreeviewStore } from "@ogw_front/stores/treeview";

const { id: viewId } = defineProps({ id: { type: String, required: true } });
const emit = defineEmits(["show-menu"]);

const treeviewStore = useTreeviewStore();
const {
  items: rawItems,
  componentsCache,
  localCategories,
  selection: visibleComponents,
  updateVisibility,
} = useModelComponents(viewId);

const currentView = computed(() =>
  treeviewStore.opened_views.find((view) => view.id === viewId),
);

const opened = computed({
  get: () => currentView.value?.opened || [],
  set: (val) => treeviewStore.setOpened(viewId, val),
});

const {
  search,
  sortType,
  filterOptions,
  processedItems: filteredCategories,
  availableFilterOptions,
  toggleSort,
  customFilter,
} = useTreeFilter(localCategories);

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

  return filteredCategories.value.map((category) => {
    const item = {};
    for (const key in category) {
      if (Object.hasOwn(category, key)) {
        item[key] = category[key];
      }
    }
    item.children = sortAndFormatItems(
      componentsCache.value?.[category.id],
      sortType.value,
    );
    return item;
  });
});

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
      @collapse-all="opened = []"
    />

    <FetchingData v-if="rawItems === undefined" :size="48" :width="4" text="" />

    <CommonTreeView
      v-model:opened="opened"
      :selected="visibleComponents"
      :items="itemsForTreeView"
      :selection="{ selectable: true, strategy: 'classic' }"
      :scroll-top="currentView?.scrollTop || 0"
      class="transparent-treeview virtual-tree-height"
      @update:selected="updateVisibility"
      @click:item="updateVisibility([$event.id, ...visibleComponents])"
      @update:scroll-top="treeviewStore.setScrollTop(viewId, $event)"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item"
          :is-leaf="isLeaf"
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

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
