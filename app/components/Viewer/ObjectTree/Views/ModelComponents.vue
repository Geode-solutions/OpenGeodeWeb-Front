<script setup>
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeFilter } from "@ogw_front/composables/use_tree_filter";

const { id } = defineProps({ id: { type: String, required: true } });
const emit = defineEmits(["show-menu"]);

const dataStore = useDataStore();
const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const items = dataStore.refFormatedMeshComponents(toRef(() => id));
const mesh_components_selection = dataStyleStore.visibleMeshComponents(
  toRef(() => id),
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
    await dataStyleStore.setModelComponentsVisibility(id, added, true);
  }
  if (removed.length > 0) {
    await dataStyleStore.setModelComponentsVisibility(id, removed, false);
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

    <v-treeview
      :selected="mesh_components_selection"
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
              modelId: id,
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
