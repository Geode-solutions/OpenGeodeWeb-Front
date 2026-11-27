<script setup lang="ts">
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import PhysicalPropertyActions from "@ogw_front/components/Viewer/ObjectTree/Base/PhysicalPropertyActions.vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useHoverhighlight } from "@ogw_front/composables/hover_highlight";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelPhysicalProperties } from "@ogw_front/composables/model_physical_properties";
import { useModelVisibility } from "@ogw_front/composables/model_tree";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

interface Props {
  // The model whose physical properties are listed
  modelId: string;
  // This tree among the opened views
  viewId: string;
}

const { modelId, viewId } = defineProps<Props>();

// A property, or a component carrying it with its value
interface PhysicalPropertyRow {
  raw?: PhysicalPropertyRow;
  id: string;
  title?: string;
  children?: PhysicalPropertyRow[];
  viewer_id?: number;
  // Of all the components carrying a property
  viewer_ids?: number[];
  physical_value?: string;
}

const treeviewStore = useTreeviewStore();
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();
const { onHoverEnter, onHoverLeave } = useHoverhighlight();
const { selection: visibleComponents, updateVisibility } = useModelVisibility(modelId);
const {
  physicalProperties,
  rows,
  search,
  sortType,
  toggleSort,
  filterOptions,
  availableFilterOptions,
} = useModelPhysicalProperties(modelId);

const currentView = computed(() => treeviewStore.opened_views.find((view) => view.id === viewId));
const opened = computed<string[]>({
  get: () => currentView.value?.opened ?? [],
  set: (val) => treeviewStore.setOpened(viewId, val),
});

const items = computed(() => rows.value as unknown as PhysicalPropertyRow[]);
// All the properties, also those a search hides: the coloring takes all their components
const nodesById = computed(() => new Map(physicalProperties.value.map((node) => [node.id, node])));

function actualRow(item: PhysicalPropertyRow): PhysicalPropertyRow {
  return item.raw ?? item;
}

// The viewer ids of a component, or of all the components carrying a property
function viewerIds(item: PhysicalPropertyRow): number[] {
  const row = actualRow(item);
  if (row.viewer_ids) {
    return row.viewer_ids;
  }
  if (Number.isInteger(row.viewer_id)) {
    return [row.viewer_id as number];
  }
  return [];
}

function handleHoverEnter({
  item,
  immediate = false,
}: {
  item: PhysicalPropertyRow;
  immediate?: boolean;
}): void {
  const ids = viewerIds(item);
  if (ids.length > 0) {
    onHoverEnter(modelId, () => ids, "model", immediate);
  }
}

function expandAll(): void {
  opened.value = rows.value.map((node) => node.id);
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
      :selected="visibleComponents"
      v-model:opened="opened"
      v-model:active="treeviewStore.activeItems"
      :items="items"
      :options="{ selection: { selectable: true, strategy: 'classic' }, search }"
      :is-row-viewable="() => dataStore.isViewable(modelId)"
      :scroll-top="currentView?.scrollTop || 0"
      class="transparent-treeview virtual-tree-height"
      @update:selected="(val) => updateVisibility(val as string[])"
      @update:scroll-top="treeviewStore.setScrollTop(viewId, $event)"
      @hover:enter="
        ({ item, immediate }) =>
          handleHoverEnter({ item: item as unknown as PhysicalPropertyRow, immediate })
      "
      @hover:leave="onHoverLeave(modelId)"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item as unknown as DisplayItem"
          :is-leaf="isLeaf"
          :model-id="modelId"
          show-tooltip
          class="text-body-1"
        />
      </template>

      <template #append="{ item }">
        <PhysicalPropertyActions
          :model-id="modelId"
          :row="actualRow(item as unknown as PhysicalPropertyRow)"
          :node="nodesById.get(actualRow(item as unknown as PhysicalPropertyRow).id)"
        />
        <v-btn
          v-if="viewerIds(item as unknown as PhysicalPropertyRow).length > 0"
          icon="ph-target"
          size="medium"
          variant="text"
          v-tooltip="'Focus camera on object'"
          @click.stop="
            hybridViewerStore.focusCameraOnObject(
              modelId,
              viewerIds(item as unknown as PhysicalPropertyRow),
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
