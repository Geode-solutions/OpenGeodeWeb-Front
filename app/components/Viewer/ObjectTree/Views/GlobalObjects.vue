<script setup lang="ts">
import type {
  GeodeObjectTyped,
  TreeNodeId,
  TreeViewId,
  ViewerObjectTyped,
} from "@ogw_front/types/identifiers";
import {
  type TreeMenuPayload,
  compareSelections,
  isObjectTreeRowViewable,
  withPendingImports,
} from "@ogw_front/utils/treeview";
// oxlint-disable max-dependencies, eslint/max-lines
import type { CssColor, Title } from "@ogw_front/types/ui";
import type { LinkedTreeRow, TreeRowHoverPayload } from "@ogw_front/types/props/viewer/object_tree";
import {
  type MapStyle,
  basemapGroup,
  isBasemapId,
  mapId,
  nextBasemapMaps,
} from "@ogw_front/utils/basemap_tree";
import { isImage, isModel } from "@ogw_front/utils/viewer_object_type";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { useBasemapStore } from "@ogw_front/stores/basemap";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHoverhighlight } from "@ogw_front/composables/hover_highlight";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeFilter } from "@ogw_front/composables/tree_filter";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

// A row of the objects tree: a data, a group of data by type or a basemap

interface Emits {
  "show-menu": [payload: TreeMenuPayload];
}

interface GlobalObjectsTreeItem extends Partial<GeodeObjectTyped>, Partial<ViewerObjectTyped> {
  raw?: GlobalObjectsTreeItem;
  id: TreeNodeId;
  title?: Title;
  children?: GlobalObjectsTreeItem[];
  loading?: boolean;
}

const treeviewStore = useTreeviewStore();
const dataStore = useDataStore();
const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const basemapStore = useBasemapStore();
const { onHoverEnter, onHoverLeave } = useHoverhighlight();

const emit = defineEmits<Emits>();

const mainView = computed<GlobalObjectsTreeItem>(() => treeviewStore.opened_views[0]);
const opened = computed<TreeNodeId[]>({
  get: () => mainView.value?.opened || [],
  set: (val) => treeviewStore.setOpened(mainView.value?.id ?? "", val),
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
} = useTreeFilter(() => withPendingImports(treeviewStore.items, treeviewStore.pendingImports), {
  recursiveSort: true,
});

// The basemap category comes first, out of the data sort and filters
const displayedItems = computed(() => {
  if (!basemapStore.available) {
    return processedItems.value;
  }
  return [basemapGroup(), ...processedItems.value];
});

// The basemap rows show the basemap state: they are never stored in the data selection
const basemapRows = computed<TreeNodeId[]>(() =>
  basemapStore.maps.map((mapStyle) => mapId(mapStyle)),
);

async function showBasemap(maps: MapStyle[]): Promise<void> {
  try {
    await basemapStore.setMaps(maps);
  } catch {
    // Already reported by the request feedback
  }
}

// Basemap rows are never filtered out by the search
function onUpdateSelection(newSelection: TreeNodeId[]): void {
  const { added, removed } = compareSelections(newSelection, basemapRows.value);
  const maps = nextBasemapMaps(basemapStore.maps, basemapStore.shown, added, removed);
  if (maps.join(",") !== basemapStore.maps.join(",")) {
    void showBasemap(maps);
  }
  const data = newSelection.filter((id) => !isBasemapId(id));
  treeviewStore.selection = applySearchFilter(data, treeviewStore.selection);
}

const visibleSelection = computed<TreeNodeId[]>(() => [
  ...applySearchFilter(treeviewStore.selection, []),
  ...basemapRows.value,
]);

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

function showMenu(event: MouseEvent, item: GlobalObjectsTreeItem): void {
  const actualItem = item.raw || item;
  if (actualItem.loading) {
    return;
  }
  if (isBasemapId(actualItem.id)) {
    emit("show-menu", { event, itemId: actualItem.id, context_type: "basemap" });
    return;
  }
  if (!actualItem.children) {
    emit("show-menu", { event, itemId: actualItem.id });
    return;
  }
  const childIds = actualItem.children.map((child) => child.id);
  emit("show-menu", {
    event,
    itemId: actualItem.id,
    context_type: "geode_object_type",
    targetIds: applySearchFilter(childIds),
  });
}

// Color of the opened model tree of a data, the link between the row and that tree
function modelTreeColor(id: TreeViewId): CssColor | undefined {
  return treeviewStore.opened_views.find((view) => view.id === id)?.color;
}

// The row of the model whose tree header is hovered
const linkedRow = computed<LinkedTreeRow | undefined>(() => {
  const id = treeviewStore.hoveredModelId;
  if (id === undefined) {
    return undefined;
  }
  const color = modelTreeColor(id);
  if (color === undefined) {
    return undefined;
  }
  return { id, color };
});

function handleHoverEnter({
  item,
  immediate = false,
}: TreeRowHoverPayload<GlobalObjectsTreeItem>): void {
  const actualItem = item.raw || item;

  // Images are not pickable: the viewer has nothing to highlight
  if (!actualItem.viewer_object_type || isImage(actualItem)) {
    return;
  }

  const itemIsModel = isModel(actualItem);
  if (itemIsModel) {
    treeviewStore.setHoveredModel(actualItem.id);
  }

  onHoverEnter(
    actualItem.id,
    async () => {
      if (itemIsModel) {
        return await dataStore.getAllModelComponentsViewerIds(actualItem.id);
      }
      return [];
    },
    itemIsModel ? "model" : "mesh",
    immediate,
  );
}

function handleHoverLeave({ item }: TreeRowHoverPayload<GlobalObjectsTreeItem>): void {
  const actualItem = item.raw || item;
  if (!actualItem.viewer_object_type || isImage(actualItem)) {
    return;
  }
  if (treeviewStore.hoveredModelId === actualItem.id) {
    treeviewStore.setHoveredModel(undefined);
  }
  onHoverLeave(actualItem.id);
}

function expandAll(): void {
  const allIds: TreeNodeId[] = [];
  function traverse(itemsList: GlobalObjectsTreeItem[]): void {
    for (const item of itemsList) {
      if (item.children && item.children.length > 0) {
        allIds.push(item.id);
        traverse(item.children);
      }
    }
  }
  traverse(displayedItems.value);
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
      v-model:active="treeviewStore.activeItems"
      :items="displayedItems"
      :options="{
        selection: { selectable: true },
        search,
        customFilter,
      }"
      :scroll-top="mainView?.scrollTop || 0"
      :linked="linkedRow"
      :is-row-viewable="(row) => isObjectTreeRowViewable(row, dataStore.isViewable)"
      class="transparent-treeview virtual-tree-height"
      @update:selected="(val) => onUpdateSelection(val as string[])"
      @update:scroll-top="treeviewStore.setScrollTop(mainView?.id ?? '', $event)"
      @hover:enter="
        ({ item, immediate }) =>
          handleHoverEnter({ item: item as unknown as GlobalObjectsTreeItem, immediate })
      "
      @hover:leave="
        ({ item }) => handleHoverLeave({ item: item as unknown as GlobalObjectsTreeItem })
      "
      @contextmenu="showMenu($event.event, $event.item as unknown as GlobalObjectsTreeItem)"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item as unknown as DisplayItem"
          :is-leaf="isLeaf"
          :show-crs="isLeaf && !isBasemapId(item.id as string)"
          @contextmenu="showMenu($event, item as unknown as GlobalObjectsTreeItem)"
        />
      </template>

      <template #append="{ item }">
        <template v-if="item.geode_object_type !== 'HorizonStack3D' && !item.loading">
          <v-btn
            v-if="item.viewer_object_type"
            data-testid="focusObjectButton"
            icon="ph-target"
            size="medium"
            variant="text"
            v-tooltip="'Focus camera on object'"
            @click.stop="hybridViewerStore.focusCameraOnObject(item.id as string)"
          />
          <v-btn
            v-if="isModel(item as unknown as GlobalObjectsTreeItem)"
            data-testid="expandModelComponentsButton"
            icon
            size="medium"
            style="height: 23px; width: 23px"
            class="ml-2"
            :variant="modelTreeColor(item.id as string) ? 'tonal' : 'text'"
            :color="modelTreeColor(item.id as string)"
            v-tooltip="
              modelTreeColor(item.id as string)
                ? 'Close model\'s mesh components'
                : 'Model\'s mesh components'
            "
            @click.stop="
              treeviewStore.displayAdditionalTree(
                item.id as string,
                item.title as string | undefined,
                item.geode_object_type as GeodeObjectType,
              )
            "
          >
            <v-icon size="18">ph-magnifying-glass-plus</v-icon>
          </v-btn>
        </template>
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
