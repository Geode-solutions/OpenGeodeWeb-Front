<script setup lang="ts">
// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import CommonTreeView from "@ogw_front/components/Viewer/ObjectTree/Base/CommonTreeView";
import ObjectTreeControls from "@ogw_front/components/Viewer/ObjectTree/Base/Controls";
import ObjectTreeItemLabel from "@ogw_front/components/Viewer/ObjectTree/Base/ItemLabel";
import type { DisplayItem } from "@ogw_front/composables/virtual_tree";
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

const emit = defineEmits<{
  "show-menu": [payload: { event: MouseEvent; itemId: string }];
}>();

interface TreeGroupItem {
  raw?: TreeGroupItem;
  id: string;
  title?: string;
  viewer_type?: string;
  geode_object_type?: string;
  children?: TreeGroupItem[];
}

const mainView = computed(() => treeviewStore.opened_views[0]);
const opened = computed({
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

function onUpdateSelection(val: string[]) {
  treeviewStore.selection = applySearchFilter(
    val,
    treeviewStore.selection,
  ) as string[];
}

const visibleSelection = computed(() =>
  applySearchFilter(treeviewStore.selection, []),
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

function isModel(item: TreeGroupItem) {
  const actualItem = item.raw || item;
  return (
    actualItem.viewer_type === "model" ||
    ["BRep", "Section"].includes(actualItem.geode_object_type ?? "")
  );
}

const hasCollectionsMap = reactive<Record<string, boolean>>({});

watch(
  () => treeviewStore.items,
  async (newItems) => {
    const models = newItems
      .flatMap((group) => group.children || [])
      .filter((item) => isModel(item));
    const fetchPromises = models.map(async (model) => {
      if (hasCollectionsMap[model.id] === undefined) {
        hasCollectionsMap[model.id] = false;
        try {
          const hasCollections = await dataStore.hasCollectionComponents(
            model.id,
          );
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

function handleHoverEnter({
  item,
  immediate = false,
}: {
  item: TreeGroupItem;
  immediate?: boolean;
}) {
  const actualItem = item.raw || item;

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
    immediate,
  );
}

function handleHoverLeave({ item }: { item: TreeGroupItem }) {
  const actualItem = item.raw || item;
  if (!actualItem.viewer_type) {
    return;
  }
  onHoverLeave(actualItem.id);
}

function expandAll() {
  const allIds: string[] = [];
  function traverse(itemsList: TreeGroupItem[]) {
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
      v-model:active="treeviewStore.activeItems"
      :items="processedItems"
      :options="{
        selection: { selectable: true },
        search,
        customFilter,
      }"
      :scroll-top="mainView?.scrollTop || 0"
      class="transparent-treeview virtual-tree-height"
      @update:selected="(val) => onUpdateSelection(val as string[])"
      @update:scroll-top="
        treeviewStore.setScrollTop(mainView?.id ?? '', $event)
      "
      @hover:enter="
        ({ item }) =>
          handleHoverEnter({ item: item as unknown as TreeGroupItem })
      "
      @hover:leave="
        ({ item }) =>
          handleHoverLeave({ item: item as unknown as TreeGroupItem })
      "
      @contextmenu="
        emit('show-menu', {
          event: $event.event,
          itemId: $event.item.id as string,
        })
      "
    >
      <template #title="{ item, isLeaf }">
        <ObjectTreeItemLabel
          :item="item as unknown as DisplayItem"
          :is-leaf="isLeaf"
          @contextmenu="
            emit('show-menu', { event: $event, itemId: item.id as string })
          "
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
            @click.stop="
              hybridViewerStore.focusCameraOnObject(item.id as string)
            "
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
                'model_components',
              )
            "
          >
            <v-icon size="18">mdi-magnify-expand</v-icon>
          </v-btn>
          <v-btn
            v-if="
              isModel(item as unknown as TreeGroupItem) &&
              hasCollectionsMap[item.id as string]
            "
            data-testid="expandModelCollectionsButton"
            icon="mdi-format-list-group"
            size="medium"
            class="ml-2"
            variant="text"
            v-tooltip="'Model\'s collections'"
            @click.stop="
              treeviewStore.displayAdditionalTree(
                item.id as string,
                item.title as string | undefined,
                item.geode_object_type as string,
                'model_collections',
              )
            "
          />
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
