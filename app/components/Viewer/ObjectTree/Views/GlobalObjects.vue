<script setup lang="ts">
// oxlint-disable max-dependencies
import {
  type BasemapStyle,
  basemapGroup,
  isBasemapId,
  nextBasemapStyle,
  withBasemapSelection,
} from "@ogw_front/utils/basemap_tree";
import { type TreeMenuPayload, compareSelections } from "@ogw_front/utils/treeview";
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView.vue";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls.vue";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel.vue";
import { useBasemapStore } from "@ogw_front/stores/basemap";
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
const basemapStore = useBasemapStore();
const { onHoverEnter, onHoverLeave } = useHoverhighlight();

interface Emits {
  "show-menu": [payload: TreeMenuPayload];
}

const emit = defineEmits<Emits>();

interface TreeGroupItem {
  raw?: TreeGroupItem;
  id: string;
  title?: string;
  viewer_type?: string;
  geode_object_type?: string;
  children?: TreeGroupItem[];
}

const mainView = computed<TreeGroupItem>(() => treeviewStore.opened_views[0]);
const opened = computed<string[]>({
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
} = useTreeFilter(() => treeviewStore.items, { recursiveSort: true });

// The basemap category comes first, out of the data sort and filters
const displayedItems = computed(() =>
  basemapStore.available ? [basemapGroup(), ...processedItems.value] : processedItems.value,
);

function basemapIds(selection: readonly string[]): string {
  return selection.filter((id) => isBasemapId(id)).join(",");
}

// The tree shows the basemap state: one visible map, or none
watch(
  () => basemapStore.style,
  (style) => {
    const synced = withBasemapSelection(treeviewStore.selection, style);
    if (basemapIds(synced) !== basemapIds(treeviewStore.selection)) {
      treeviewStore.selection = synced;
    }
  },
  { immediate: true },
);

function withoutBasemap(selection: readonly string[]): string[] {
  return selection.filter((id) => !isBasemapId(id));
}

async function showBasemap(style: BasemapStyle): Promise<void> {
  try {
    await basemapStore.setStyle(style);
  } catch {
    // Already reported by the request feedback
  }
}

// Only user clicks choose the visible map: clear and import rewrite the selection with data only.
// Basemap rows are never filtered out by the search
function onUpdateSelection(val: string[]): void {
  const previous = treeviewStore.selection;
  const { added, removed } = compareSelections(val, previous);
  const style = nextBasemapStyle(basemapStore.style, basemapStore.map, added, removed);
  if (style !== basemapStore.style) {
    void showBasemap(style);
  }
  const data = applySearchFilter(withoutBasemap(val), withoutBasemap(previous));
  treeviewStore.selection = withBasemapSelection(data, style);
}

const visibleSelection = computed<string[]>(() => [
  ...applySearchFilter(withoutBasemap(treeviewStore.selection), []),
  ...treeviewStore.selection.filter((id) => isBasemapId(id)),
]);

watch(
  () => treeviewStore.selection,
  async (current, previous) => {
    const oldSelection = previous || [];
    if (current === oldSelection) {
      return;
    }

    const { added, removed } = compareSelections(current, previous);

    // A selection written without the basemap rows (clear, import) shows the basemap state again
    const synced = withBasemapSelection(current, basemapStore.style);
    if (basemapIds(current) !== basemapIds(synced)) {
      treeviewStore.selection = synced;
    }

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

function showMenu(event: MouseEvent, item: TreeGroupItem): void {
  const actualItem = item.raw || item;
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

function isModel(item: TreeGroupItem): boolean {
  const actualItem = item.raw || item;
  return (
    actualItem.viewer_type === "model" ||
    ["BRep", "Section"].includes(actualItem.geode_object_type ?? "")
  );
}

function handleHoverEnter({
  item,
  immediate = false,
}: {
  item: TreeGroupItem;
  immediate?: boolean;
}): void {
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

function handleHoverLeave({ item }: { item: TreeGroupItem }): void {
  const actualItem = item.raw || item;
  if (!actualItem.viewer_type) {
    return;
  }
  onHoverLeave(actualItem.id);
}

function expandAll(): void {
  const allIds: string[] = [];
  function traverse(itemsList: TreeGroupItem[]): void {
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
      class="transparent-treeview virtual-tree-height"
      @update:selected="(val) => onUpdateSelection(val as string[])"
      @update:scroll-top="treeviewStore.setScrollTop(mainView?.id ?? '', $event)"
      @hover:enter="
        ({ item, immediate }) =>
          handleHoverEnter({ item: item as unknown as TreeGroupItem, immediate })
      "
      @hover:leave="({ item }) => handleHoverLeave({ item: item as unknown as TreeGroupItem })"
      @contextmenu="showMenu($event.event, $event.item as unknown as TreeGroupItem)"
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item as unknown as DisplayItem"
          :is-leaf="isLeaf"
          :show-crs="isLeaf && !isBasemapId(item.id as string)"
          @contextmenu="showMenu($event, item as unknown as TreeGroupItem)"
        />
      </template>

      <template #append="{ item }">
        <template v-if="item.geode_object_type !== 'HorizonStack3D'">
          <v-btn
            v-if="item.viewer_type"
            data-testid="focusObjectButton"
            icon="mdi-target"
            size="medium"
            variant="text"
            v-tooltip="'Focus camera on object'"
            @click.stop="hybridViewerStore.focusCameraOnObject(item.id as string)"
          />
          <v-btn
            v-if="isModel(item as unknown as TreeGroupItem)"
            data-testid="expandModelComponentsButton"
            icon
            size="medium"
            style="height: 23px; width: 23px"
            class="ml-2"
            variant="text"
            v-tooltip="'Model\'s mesh components'"
            @click.stop="
              treeviewStore.displayAdditionalTree(
                item.id as string,
                item.title as string | undefined,
                item.geode_object_type as string,
              )
            "
          >
            <v-icon size="18">mdi-magnify-expand</v-icon>
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
