<script setup>
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHoverhighlight } from "@ogw_front/composables/use_hover_highlight";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeFilter } from "@ogw_front/composables/use_tree_filter";
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
} = useTreeFilter(
  toRef(() => treeviewStore.items),
  { recursiveSort: true },
);

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

function handleHoverEnter(item) {
  const actualItem = item.raw || item;

  // Sécurité : Ne pas highlight si ce n'est pas un objet réel du viewer
  if (!actualItem.viewer_type) {
    return;
  }

  const is_model = isModel(item);

  onHoverEnter(
    actualItem.id,
    async () =>
      is_model
        ? await dataStore.getAllModelComponentsViewerIds(actualItem.id)
        : [],
    is_model ? "model" : "mesh",
  );
}

function handleHoverLeave(item) {
  const actualItem = item.raw || item;
  if (!actualItem.viewer_type) {
    return;
  }
  onHoverLeave(actualItem.id);
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

    <CommonTreeView
      v-model:selected="treeviewStore.selection"
      v-model:opened="opened"
      :items="processedItems"
      :search="search"
      :custom-filter="customFilter"
      :selection="{ selectable: true }"
      :scroll-top="mainView?.scrollTop || 0"
      class="transparent-treeview virtual-tree-height"
      @update:scroll-top="treeviewStore.setScrollTop(mainView.id, $event)"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item"
          :is-leaf="isLeaf"
          @contextmenu="emit('show-menu', { event: $event, itemId: item.id })"
          @mouseenter="handleHoverEnter(item)"
          @mouseleave="handleHoverLeave(item)"
        />
      </template>

      <template #append="{ item }">
        <v-btn
          v-if="isModel(item)"
          icon="mdi-magnify-expand"
          size="medium"
          class="ml-8"
          variant="text"
          v-tooltip="'Model\'s mesh components'"
          @click.stop="
            treeviewStore.displayAdditionalTree(item.id, item.title, item.geode_object_type)
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
