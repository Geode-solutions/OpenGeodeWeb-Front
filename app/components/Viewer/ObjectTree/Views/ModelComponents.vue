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
  set: (val) => treeviewStore.setOpened(viewId, val),
});

const items = dataStore.refFormatedMeshComponents(toRef(() => viewId));
const mesh_components_selection = dataStyleStore.visibleMeshComponents(
  toRef(() => viewId),
);

const {
  search,
  sortType,
  filterOptions,
  processedItems,
  availableFilterOptions,
  toggleSort,
  customFilter,
} = useTreeFilter(items);

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
      select-strategy="independent"
      selectable
      @update:selected="onSelectionChange"
    >
      <template #title="{ item }">
        <ObjectTreeItemLabel
          :item="item"
          show-tooltip
          @contextmenu="
            emit('show-menu', {
              event: $event,
              itemId: item.id,
              context_type: 'model_component',
              modelId: viewId,
            })
          "
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
