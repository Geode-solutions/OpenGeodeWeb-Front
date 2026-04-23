<script setup>
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

async function handleHoverEnter(item) {
  const actualItem = item.raw || item;
  const is_model = isModel(item);
  const type = is_model ? "model" : "mesh";
  let block_ids = [];
  if (is_model) {
    const [cornerIds, lineIds, surfaceIds, blockIds] = await Promise.all([
      dataStore.getCornersGeodeIds(actualItem.id),
      dataStore.getLinesGeodeIds(actualItem.id),
      dataStore.getSurfacesGeodeIds(actualItem.id),
      dataStore.getBlocksGeodeIds(actualItem.id),
    ]);
    const allGeodeIds = [...cornerIds, ...lineIds, ...surfaceIds, ...blockIds];
    block_ids = await dataStore.getMeshComponentsViewerIds(actualItem.id, allGeodeIds);
  }
  onHoverEnter(actualItem.id, is_model ? block_ids : undefined, type);
}

function handleHoverLeave(item) {
  const actualItem = item.raw || item;
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
    />

    <v-treeview
      v-model:selected="treeviewStore.selection"
      v-model:opened="opened"
      :items="processedItems"
      :search="search"
      :custom-filter="customFilter"
      class="transparent-treeview"
      item-value="id"
      select-strategy="classic"
      selectable
      items-registration="props"
    >
      <template #title="{ item }">
        <div @mouseenter="handleHoverEnter(item)" @mouseleave="handleHoverLeave(item)">
          <ObjectTreeItemLabel
            :item="item"
            @contextmenu="emit('show-menu', { event: $event, itemId: item.id })"
          />
        </div>
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
