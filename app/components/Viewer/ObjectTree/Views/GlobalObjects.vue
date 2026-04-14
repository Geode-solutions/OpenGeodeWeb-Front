<script setup>
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { compareSelections } from "@ogw_front/utils/treeview";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeFilter } from "@ogw_front/composables/use_tree_filter";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const treeviewStore = useTreeviewStore();
const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const emit = defineEmits(["show-menu"]);

const {
  search,
  sortType,
  filterOptions,
  processedItems,
  availableFilterOptions,
  toggleSort,
  customFilter,
} = useTreeFilter(toRef(() => treeviewStore.items));

watch(
  () => treeviewStore.selection,
  async (current, previous) => {
    const oldSelection = previous || [];
    if (current === oldSelection) {
      return;
    }

    const { added, removed } = compareSelections(current, previous);

    const allObjectIds = new Set(
      treeviewStore.items.flatMap((group) =>
        group.children.map((child) => child.id),
      ),
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
  return item.viewer_type === "model";
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
      v-model:selected="treeviewStore.selection"
      :items="processedItems"
      :search="search"
      :custom-filter="customFilter"
      class="transparent-treeview"
      item-value="id"
      select-strategy="classic"
      selectable
    >
      <template #title="{ item }">
        <ObjectTreeItemLabel
          :item="item"
          @contextmenu="emit('show-menu', { event: $event, itemId: item.id })"
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
            treeviewStore.displayAdditionalTree(
              item.id,
              item.title,
              item.geode_object_type,
            )
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
