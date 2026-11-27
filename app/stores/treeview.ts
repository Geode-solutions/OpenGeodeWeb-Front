import type { DataId, GeodeId } from "@geode/opengeodeweb-microservice/schema_types";
import type {
  GeodeIdentified,
  GeodeObjectTyped,
  ViewerObjectTyped,
} from "@ogw_front/types/identifiers";
import type {
  GeodeObjectType,
  ViewerObjectType,
} from "@geode/opengeodeweb-microservice/data_types";
import type {
  OpenedView,
  TreeviewConfigRecord,
} from "@ogw_internal/database/tables/treeview_config";
import type { TreeGroup, TreeNode } from "@ogw_front/types/tree";
import { ref, watch } from "vue";
import { consola } from "consola";
// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports, eslint/max-lines
import { defineStore } from "pinia";
import { nextModelTreeColor } from "@ogw_front/utils/treeview";
import { treeviewConfigDb } from "@ogw_internal/database/database";

const PANEL_WIDTH = 300;

interface TreeviewChild extends TreeNode, GeodeIdentified, GeodeObjectTyped, ViewerObjectTyped {
  // Still being loaded in the viewer: shown with a spinner and not interactive yet
  loading?: boolean;
}

// A file being imported: shown in its type group while the back-end converts it, before its data exist
interface PendingImport extends TreeNode, GeodeObjectTyped {
  loading: true;
}

type TreeviewGroup = TreeGroup<TreeviewChild>;

interface TreeviewSnapshot {
  opened_views?: OpenedView[];
  panelWidth?: number;
  additionalPanelWidth?: number;
  rowHeights?: number[];
  selectionIds?: string[];
  selection?: (string | { id: string })[];
}

function defaultOpenedViews(): OpenedView[] {
  return [{ type: "object", id: "main", title: "Objects", scrollTop: 0, opened: [] }];
}

type ReadonlyOpenedView = Omit<OpenedView, "opened"> & {
  readonly opened: readonly string[];
};
type ReadonlyTreeviewGroup = Omit<TreeviewGroup, "children"> & {
  readonly children: readonly TreeviewChild[];
};
interface ReadonlyTreeviewSnapshot {
  opened_views?: readonly ReadonlyOpenedView[];
  panelWidth?: number;
  additionalPanelWidth?: number;
  rowHeights?: readonly number[];
  selectionIds?: readonly string[];
  selection?: readonly (string | { id: string })[];
}

// Model trees saved before they had a color get one, distinct from the others
function withModelTreeColors(views: OpenedView[]): OpenedView[] {
  const used: (string | undefined)[] = views.map((view) => view.color);
  for (const view of views) {
    if (view.type === "component" && view.color === undefined) {
      view.color = nextModelTreeColor(used);
      used.push(view.color);
    }
  }
  return views;
}

function snapshotSelectionIds(snapshot: ReadonlyTreeviewSnapshot | undefined): string[] {
  if (snapshot?.selectionIds) {
    return [...snapshot.selectionIds];
  }
  return (snapshot?.selection ?? []).map((selectionItem: string | { id: string }) =>
    typeof selectionItem === "string" ? selectionItem : selectionItem.id,
  );
}

// oxlint-disable-next-line max-lines-per-function, max-statements
export const useTreeviewStore = defineStore("treeview", () => {
  const items = ref<TreeviewGroup[]>([]);
  const selection = ref<string[]>([]);
  const activeItems = ref<string[]>([]);
  const opened_views = ref<OpenedView[]>(defaultOpenedViews());
  const panelWidth = ref(PANEL_WIDTH);
  const additionalPanelWidth = ref(PANEL_WIDTH);
  const isImporting = ref(false);
  const pendingImports = ref<PendingImport[]>([]);
  let lastPendingImport = 0;
  const pendingSelectionIds = ref<string[]>([]);
  const rowHeights = ref<number[]>([]);
  // Model hovered in the objects tree or on its model tree header: not saved
  const hoveredModelId = ref<string | undefined>(undefined);

  const treeviewConfigTable = treeviewConfigDb();

  async function loadConfig(): Promise<void> {
    try {
      const config = await treeviewConfigTable.get("main");
      if (config?.opened_views) {
        opened_views.value = withModelTreeColors(config.opened_views);
      }
      if (config?.panelWidth !== undefined && config.panelWidth !== 0) {
        panelWidth.value = config.panelWidth;
      }
      if (config?.additionalPanelWidth !== undefined && config.additionalPanelWidth !== 0) {
        additionalPanelWidth.value = config.additionalPanelWidth;
      }
      if (config?.selectionIds) {
        selection.value = config.selectionIds;
      }
      if (config?.rowHeights) {
        rowHeights.value = config.rowHeights;
      }
    } catch (error) {
      consola.error("Failed to load treeview config:", String(error));
    }
  }
  // oxlint-disable-next-line typescript/no-floating-promises -- loadConfig catches its own errors internally.
  loadConfig();

  watch(
    [opened_views, panelWidth, additionalPanelWidth, selection, rowHeights],
    async () => {
      // oxlint-disable-next-line unicorn/prefer-structured-clone, no-unsafe-type-assertion -- JSON round-trip of a known-shape ref; result matches the source type.
      const clean_opened_views = JSON.parse(JSON.stringify(opened_views.value)) as OpenedView[];
      // oxlint-disable-next-line unicorn/prefer-structured-clone, no-unsafe-type-assertion -- JSON round-trip of a known-shape ref; result matches the source type.
      const clean_selectionIds = JSON.parse(JSON.stringify(selection.value)) as string[];
      // oxlint-disable-next-line unicorn/prefer-structured-clone, no-unsafe-type-assertion -- JSON round-trip of a known-shape ref; result matches the source type.
      const clean_rowHeights = JSON.parse(JSON.stringify(rowHeights.value)) as number[];

      // Best-effort persistence: a failure is logged, not thrown.
      try {
        await treeviewConfigTable.put({
          id: "main",
          opened_views: clean_opened_views,
          panelWidth: panelWidth.value,
          additionalPanelWidth: additionalPanelWidth.value,
          selectionIds: clean_selectionIds,
          rowHeights: clean_rowHeights,
        });
      } catch (error) {
        consola.error("Failed to save treeview config:", String(error));
      }
    },
    { deep: true },
  );

  // No mouseleave is sent for an element removed under the cursor: clear the hover here
  function clearHoveredModel(id: string): void {
    if (hoveredModelId.value === id) {
      hoveredModelId.value = undefined;
    }
  }

  function closeView(id: string): void {
    clearHoveredModel(id);
    opened_views.value = opened_views.value.filter((view: ReadonlyOpenedView) => view.id !== id);
  }

  function toggleView(id: string): void {
    const index = opened_views.value.findIndex((view: ReadonlyOpenedView) => view.id === id);
    if (index !== -1) {
      closeView(id);
    } else if (id === "main") {
      opened_views.value.unshift({
        type: "object",
        id: "main",
        title: "Objects",
        scrollTop: 0,
        opened: [],
      });
    }
  }

  function addItem(
    geodeObjectType: GeodeObjectType,
    name: string,
    dataId: DataId,
    geode_id: GeodeId,
    viewer_object_type: ViewerObjectType,
  ): void {
    // Loading until the import workflow has it in the viewer (see untilLoaded)
    const child: TreeviewChild = {
      title: name,
      id: dataId,
      geode_id,
      viewer_object_type,
      geode_object_type: geodeObjectType,
      loading: true,
    };
    let found = false;
    for (const item of items.value) {
      if (item.title === geodeObjectType) {
        item.children.push(child);
        const options = { numeric: true, sensitivity: "base" as const };
        item.children.sort((childA, childB) =>
          childA.title.localeCompare(childB.title, undefined, options),
        );
        found = true;
        break;
      }
    }
    if (!found) {
      items.value.push({ id: geodeObjectType, title: geodeObjectType, children: [child] });
      const sort_options = { numeric: true, sensitivity: "base" as const };
      items.value.sort((groupA: ReadonlyTreeviewGroup, groupB: ReadonlyTreeviewGroup) =>
        groupA.title.localeCompare(groupB.title, undefined, sort_options),
      );
    }
    selection.value = [...selection.value, dataId];
  }

  function removePendingImport(id: string): void {
    pendingImports.value = pendingImports.value.filter((pending) => pending.id !== id);
    // Its type group shown or hidden as a whole may have selected it
    if (selection.value.includes(id)) {
      selection.value = selection.value.filter((selectionId) => selectionId !== id);
    }
  }

  // The file is listed in the tree, by its name, until its conversion is done
  async function whilePendingImport<Result>(
    geodeObjectType: GeodeObjectType,
    filename: string,
    conversion: Promise<Result>,
  ): Promise<Result> {
    lastPendingImport += 1;
    const id = `pending-import-${lastPendingImport}`;
    const title = filename.split("/").pop() ?? filename;
    pendingImports.value.push({ id, title, geode_object_type: geodeObjectType, loading: true });
    try {
      const result = await conversion;
      return result;
    } finally {
      removePendingImport(id);
    }
  }

  // Added as loading, a data stops loading once its import is done, or has failed
  async function untilLoaded<Result>(dataId: DataId, importing: Promise<Result>): Promise<Result> {
    try {
      const result = await importing;
      return result;
    } finally {
      const child = items.value
        .flatMap((group) => group.children)
        .find((childItem) => childItem.id === dataId);
      if (child) {
        child.loading = false;
      }
    }
  }

  function removeItem(dataId: DataId): void {
    clearHoveredModel(dataId);
    for (let index = 0; index < items.value.length; index += 1) {
      const group = items.value[index];
      if (!group) {
        continue;
      }
      const childIndex = group.children.findIndex((child) => child.id === dataId);
      if (childIndex !== -1) {
        group.children.splice(childIndex, 1);
        if (group.children.length === 0) {
          items.value.splice(index, 1);
        }
        selection.value = selection.value.filter((selection_id) => selection_id !== dataId);
        return;
      }
    }
  }

  function displayAdditionalTree(
    id: string,
    title: string | undefined,
    geodeObjectType: GeodeObjectType,
  ): void {
    const index = opened_views.value.findIndex((view: ReadonlyOpenedView) => view.id === id);
    if (index !== -1) {
      closeView(id);
      return;
    }
    additionalPanelWidth.value = panelWidth.value;
    opened_views.value.push({
      type: "component",
      id,
      title: title ?? id,
      geode_object_type: geodeObjectType,
      scrollTop: 0,
      opened: [],
      color: nextModelTreeColor(opened_views.value.map((view) => view.color)),
    });
  }

  function setCollapsed(id: string, collapsed: boolean): void {
    const existing = opened_views.value.find((view: ReadonlyOpenedView) => view.id === id);
    if (existing) {
      existing.collapsed = collapsed;
    }
  }

  function toggleCollapsed(id: string): void {
    const existing = opened_views.value.find((view: ReadonlyOpenedView) => view.id === id);
    setCollapsed(id, existing?.collapsed !== true);
  }

  function setAllCollapsed(collapsed: boolean): void {
    for (const view of opened_views.value) {
      if (view.type === "component") {
        view.collapsed = collapsed;
      }
    }
  }

  function setHoveredModel(id: string | undefined): void {
    hoveredModelId.value = id;
  }

  // The objects tree keeps its place, first: only the model trees move
  function moveView(from_index: number, to_index: number): void {
    const moved = opened_views.value[from_index];
    const target = opened_views.value[to_index];
    if (moved && target && moved.id !== "main" && target.id !== "main") {
      const [element] = opened_views.value.splice(from_index, 1);
      if (element) {
        opened_views.value.splice(to_index, 0, element);
      }
    }
  }

  function importStores(snapshot: ReadonlyTreeviewSnapshot | undefined): void {
    if (snapshot?.opened_views) {
      // Copies: the snapshot keeps its views as they were saved
      opened_views.value = withModelTreeColors(
        snapshot.opened_views.map((view) => ({ ...view, opened: [...view.opened] })),
      );
    } else {
      opened_views.value = defaultOpenedViews();
    }
    panelWidth.value = snapshot?.panelWidth ?? PANEL_WIDTH;
    additionalPanelWidth.value = snapshot?.additionalPanelWidth ?? PANEL_WIDTH;
    rowHeights.value = [...(snapshot?.rowHeights ?? [])];
    pendingSelectionIds.value = snapshotSelectionIds(snapshot);
  }

  function finalizeImportSelection(): void {
    const rebuilt: string[] = [];
    for (const group of items.value) {
      for (const child of group.children) {
        if (
          pendingSelectionIds.value.length === 0 ||
          pendingSelectionIds.value.includes(child.id)
        ) {
          rebuilt.push(child.id);
        }
      }
    }
    selection.value = rebuilt;
    pendingSelectionIds.value = [];
  }

  function clear(): void {
    items.value = [];
    selection.value = [];
    activeItems.value = [];
    pendingSelectionIds.value = [];
    pendingImports.value = [];
    opened_views.value = defaultOpenedViews();
  }

  function displayFileTree(): void {
    opened_views.value = defaultOpenedViews();
  }

  function setPanelWidth(width: number): void {
    panelWidth.value = width;
  }

  function setAdditionalPanelWidth(width: number): void {
    additionalPanelWidth.value = width;
  }

  function setScrollTop(viewId: string, scrollTop: number): void {
    const view = opened_views.value.find(
      (openedView: ReadonlyOpenedView) => openedView.id === viewId,
    );
    if (view) {
      view.scrollTop = scrollTop;
    }
  }

  function setOpened(viewId: string, opened: readonly string[]): void {
    const view = opened_views.value.find(
      (openedView: ReadonlyOpenedView) => openedView.id === viewId,
    );
    if (view) {
      view.opened = [...opened];
    }
  }

  function setRowHeights(heights: readonly number[]): void {
    rowHeights.value = [...heights];
  }

  function exportStores(): Omit<TreeviewConfigRecord, "id"> {
    return {
      opened_views: opened_views.value,
      panelWidth: panelWidth.value,
      additionalPanelWidth: additionalPanelWidth.value,
      selectionIds: selection.value,
      rowHeights: rowHeights.value,
    };
  }

  function renameItem(dataId: DataId, newName: string): void {
    for (const group of items.value) {
      const child = group.children.find((childItem) => childItem.id === dataId);
      if (child) {
        child.title = newName;
        const options = { numeric: true, sensitivity: "base" as const };
        group.children.sort((childA, childB) =>
          childA.title.localeCompare(childB.title, undefined, options),
        );
        break;
      }
    }
    const view = opened_views.value.find(
      (openedView: ReadonlyOpenedView) => openedView.id === dataId,
    );
    if (view) {
      view.title = newName;
    }
  }

  return {
    items,
    selection,
    activeItems,
    opened_views,
    panelWidth,
    additionalPanelWidth,
    isImporting,
    pendingImports,
    rowHeights,
    hoveredModelId,
    setHoveredModel,
    addItem,
    whilePendingImport,
    untilLoaded,
    removeItem,
    renameItem,
    displayAdditionalTree,
    closeView,
    toggleView,
    setCollapsed,
    toggleCollapsed,
    setAllCollapsed,
    moveView,
    importStores,
    displayFileTree,
    setPanelWidth,
    setAdditionalPanelWidth,
    setScrollTop,
    setOpened,
    setRowHeights,
    exportStores,
    finalizeImportSelection,
    clear,
  };
});

export type { TreeviewSnapshot };
