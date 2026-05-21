<script setup>
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHoverhighlight } from "@ogw_front/composables/hover_highlight";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeFilter } from "@ogw_front/composables/tree_filter";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const treeviewStore = useTreeviewStore();
const dataStore = useDataStore();
const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { onHoverEnter, onHoverLeave } = useHoverhighlight();

const emit = defineEmits(["show-menu"]);

const mainView = computed(() => treeviewStore.opened_views[0]);
const opened = computed({
  get: () => mainView.value?.opened || [],
  set: (val) => treeviewStore.setOpened(mainView.value.id, val),
});

const {
  search,
  sortType,
  filterOptions,
  processedItems,
  availableFilterOptions,
  toggleSort,
  customFilter,
  applySearchFilter,
} = useTreeFilter(() => treeviewStore.items, { recursiveSort: true });

function onUpdateSelection(val) {
  treeviewStore.selection = applySearchFilter(val, treeviewStore.selection);
}

const visibleSelection = computed(() => applySearchFilter(treeviewStore.selection, []));

watch(
  () => treeviewStore.selection,
  async (current, previous) => {
    const oldSelection = previous || [];
    if (current === oldSelection) {
      return;
    }

    const { added, removed } = compareSelections(current, previous);

    const allObjectIds = new Set(
      treeviewStore.items.flatMap((group) => group.children.map((child) => child.id)),
    );

    const updates = [
      ...added
        .filter((id) => allObjectIds.has(id))
        .map((id) => dataStyleStore.setVisibility(id, true)),
      ...removed
        .filter((id) => allObjectIds.has(id))
        .map((id) => dataStyleStore.setVisibility(id, false)),
    ];
    await Promise.all(updates);
    hybridViewerStore.remoteRender();
  },
);

function isModel(item) {
  const actualItem = item.raw || item;
  return (
    actualItem.viewer_type === "model" || ["BRep", "Section"].includes(actualItem.geode_object_type)
  );
}

const hasCollectionsMap = reactive({});

watch(
  () => treeviewStore.items,
  async (newItems) => {
    const models = newItems.flatMap((group) => group.children || []).filter((item) => isModel(item));
    const fetchPromises = models.map(async (model) => {
      if (hasCollectionsMap[model.id] === undefined) {
        hasCollectionsMap[model.id] = false;
        try {
          const hasCollections = await dataStore.hasCollectionComponents(model.id);
          hasCollectionsMap[model.id] = hasCollections;
        } catch (error) {
          console.error("Failed to check collections", error);
        }
      }
    });

    await Promise.all(fetchPromises);
  },
  { immediate: true, deep: true },
);

function handleHoverEnter({ item, immediate = false }) {
  const actualItem = item.raw || item;

  if (!actualItem.viewer_type) {
    return;
  }

  const is_model = isModel(item);

  onHoverEnter(
    actualItem.id,
    async () => (is_model ? await dataStore.getAllModelComponentsViewerIds(actualItem.id) : []),
    is_model ? "model" : "mesh",
    immediate,
  );
}

function handleHoverLeave({ item }) {
  const actualItem = item.raw || item;
  if (!actualItem.viewer_type) {
    return;
  }
  onHoverLeave(actualItem.id);
}

function expandAll() {
  const allIds = [];
  function traverse(itemsList) {
    for (const item of itemsList) {
      if (item.children && item.children.length > 0) {
        allIds.push(item.id);
        traverse(item.children);
      }
    }
  }
  traverse(treeviewStore.items);
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

    <CommonTreeView
      :selected="visibleSelection"
      v-model:opened="opened"
      :items="processedItems"
      :options="{
        selection: { selectable: true },
        search,
        customFilter,
      }"
      :scroll-top="mainView?.scrollTop || 0"
      class="transparent-treeview virtual-tree-height"
      @update:selected="onUpdateSelection"
      @update:scroll-top="treeviewStore.setScrollTop(mainView.id, $event)"
      @hover:enter="handleHoverEnter"
      @hover:leave="handleHoverLeave"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item"
          :is-leaf="isLeaf"
          @contextmenu="emit('show-menu', { event: $event, itemId: item.id })"
        />
      </template>

      <template #append="{ item }">
        <v-btn
          v-if="item.viewer_type"
          icon="mdi-target"
          size="medium"
          variant="text"
          v-tooltip="'Focus camera on object'"
          @click.stop="hybridViewerStore.focusCameraOnObject(item.id)"
        />
        <v-btn
          v-if="isModel(item)"
          icon="mdi-magnify-expand"
          size="medium"
          class="ml-2"
          variant="text"
          v-tooltip="'Model\'s mesh components'"
          @click.stop="
            treeviewStore.displayAdditionalTree(item.id, item.title, item.geode_object_type, 'model_components')
          "
        />
        <v-btn
          v-if="isModel(item) && hasCollectionsMap[item.id]"
          icon="mdi-format-list-group"
          size="medium"
          class="ml-2"
          variant="text"
          v-tooltip="'Model\'s collections'"
          @click.stop="
            treeviewStore.displayAdditionalTree(item.id, item.title, item.geode_object_type, 'model_collections')
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
  margin: 2px 0;
}
</style>
