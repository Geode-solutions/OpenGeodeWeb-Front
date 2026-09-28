// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports, eslint/max-lines
import { defineStore } from "pinia";

import type { Table } from "dexie";
import { ref, watch } from "vue";
import { compareSelections } from "@ogw_front/utils/treeview";
import { database } from "@ogw_internal/database/database";

const PANEL_WIDTH = 300;

interface OpenedView {
  type: "object" | "component";
  id: string;
  title: string;
  scrollTop: number;
  opened: string[];
  modelId?: string;
  viewType?: string;
  geode_object_type?: string;
}

interface TreeviewChild {
  title: string;
  id: string;
  viewer_type: string;
  geode_object_type: string;
}

interface TreeviewGroup {
  id: string;
  title: string;
  children: TreeviewChild[];
}

interface TreeviewConfigRecord {
  id: string;
  opened_views: OpenedView[];
  panelWidth: number;
  additionalPanelWidth: number;
  selectionIds: string[];
  rowHeights: number[];
}

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

// oxlint-disable-next-line max-lines-per-function, max-statements
export const useTreeviewStore = defineStore("treeview", () => {
  const items = ref<TreeviewGroup[]>([]);
  const selection = ref<string[]>([]);
  const activeItems = ref<string[]>([]);
  const opened_views = ref<OpenedView[]>(defaultOpenedViews());
  const panelWidth = ref(PANEL_WIDTH);
  const additionalPanelWidth = ref(PANEL_WIDTH);
  const isImporting = ref(false);
  const pendingSelectionIds = ref<string[]>([]);
  const rowHeights = ref<number[]>([]);

  // The database's table map is dynamically assembled at runtime (see internal/database/database.ts), so its exported type is a loose `{}`; cast it to the shape it actually has at runtime rather than widening every call site.
  type DatabaseTables = Record<string, unknown>;
  // oxlint-disable-next-line no-unsafe-type-assertion -- database's table map is dynamically typed at runtime; see comment above.
  const typedDatabase = database as unknown as DatabaseTables;
  // oxlint-disable-next-line no-unsafe-type-assertion -- database's table map is dynamically typed at runtime; see comment above.
  const treeview_config_db = typedDatabase.treeview_config as Table<TreeviewConfigRecord, string>;

  async function loadConfig(): Promise<void> {
    try {
      const config = await treeview_config_db.get("main");
      if (config?.opened_views) {
        opened_views.value = config.opened_views;
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
      // oxlint-disable-next-line no-console -- surfaces persistence failures during local development.
      console.error("Failed to load treeview config:", error);
    }
  }
  // oxlint-disable-next-line typescript/no-floating-promises -- loadConfig catches its own errors internally.
  loadConfig();

  watch(
    [opened_views, panelWidth, additionalPanelWidth, selection, rowHeights],
    () => {
      // oxlint-disable-next-line unicorn/prefer-structured-clone, no-unsafe-type-assertion -- JSON round-trip of a known-shape ref; result matches the source type.
      const clean_opened_views = JSON.parse(JSON.stringify(opened_views.value)) as OpenedView[];
      // oxlint-disable-next-line unicorn/prefer-structured-clone, no-unsafe-type-assertion -- JSON round-trip of a known-shape ref; result matches the source type.
      const clean_selectionIds = JSON.parse(JSON.stringify(selection.value)) as string[];
      // oxlint-disable-next-line unicorn/prefer-structured-clone, no-unsafe-type-assertion -- JSON round-trip of a known-shape ref; result matches the source type.
      const clean_rowHeights = JSON.parse(JSON.stringify(rowHeights.value)) as number[];

      // oxlint-disable-next-line typescript/no-floating-promises -- best-effort persistence; failures aren't actionable here.
      treeview_config_db.put({
        id: "main",
        opened_views: clean_opened_views,
        panelWidth: panelWidth.value,
        additionalPanelWidth: additionalPanelWidth.value,
        selectionIds: clean_selectionIds,
        rowHeights: clean_rowHeights,
      });
    },
    { deep: true },
  );

  function closeView(id: string): void {
    opened_views.value = opened_views.value.filter((view: ReadonlyOpenedView) => view.id !== id);
  }

  watch(selection, (current: readonly string[], previous: readonly string[]) => {
    const { removed } = compareSelections(current, previous);
    for (const id of removed) {
      const index = opened_views.value.findIndex(
        (view: ReadonlyOpenedView) => view.type === "component" && view.id === id,
      );
      if (index !== -1) {
        closeView(id);
      }
    }
  });

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

  function addItem(geodeObjectType: string, name: string, id: string, viewer_type: string): void {
    const child: TreeviewChild = {
      title: name,
      id,
      viewer_type,
      geode_object_type: geodeObjectType,
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
    selection.value = [...selection.value, id];
  }

  function removeItem(id: string): void {
    for (let index = 0; index < items.value.length; index += 1) {
      const group = items.value[index];
      if (!group) {
        continue;
      }
      const childIndex = group.children.findIndex((child) => child.id === id);
      if (childIndex !== -1) {
        group.children.splice(childIndex, 1);
        if (group.children.length === 0) {
          items.value.splice(index, 1);
        }
        selection.value = selection.value.filter((selection_id) => selection_id !== id);
        return;
      }
    }
  }

  function displayAdditionalTree(
    id: string,
    title: string | undefined,
    geodeObjectType: string,
    viewType = "model_components",
  ): void {
    const viewId = `${id}_${viewType}`;
    const index = opened_views.value.findIndex((view: ReadonlyOpenedView) => view.id === viewId);
    if (index !== -1) {
      closeView(viewId);
      return;
    }
    additionalPanelWidth.value = panelWidth.value;
    opened_views.value.push({
      type: "component",
      id: viewId,
      modelId: id,
      viewType,
      title: title ?? id,
      geode_object_type: geodeObjectType,
      scrollTop: 0,
      opened: [],
    });
  }

  function moveView(from_index: number, to_index: number): void {
    if (from_index !== 0 && to_index !== 0) {
      const [element] = opened_views.value.splice(from_index, 1);
      if (element) {
        opened_views.value.splice(to_index, 0, element);
      }
    }
  }

  function importStores(snapshot: ReadonlyTreeviewSnapshot | undefined): void {
    opened_views.value = snapshot?.opened_views
      ? // oxlint-disable-next-line no-unsafe-type-assertion -- narrowing the readonly parameter view back to the mutable working type; these objects aren't actually frozen at runtime.
        ([...snapshot.opened_views] as OpenedView[])
      : defaultOpenedViews();
    panelWidth.value = snapshot?.panelWidth ?? PANEL_WIDTH;
    additionalPanelWidth.value = snapshot?.additionalPanelWidth ?? PANEL_WIDTH;
    rowHeights.value = snapshot?.rowHeights ? [...snapshot.rowHeights] : [];
    pendingSelectionIds.value = snapshot?.selectionIds
      ? [...snapshot.selectionIds]
      : (snapshot?.selection ?? []).map((selectionItem: string | { id: string }) =>
          typeof selectionItem === "string" ? selectionItem : selectionItem.id,
        );
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

  function renameItem(id: string, newName: string): void {
    for (const group of items.value) {
      const child = group.children.find((childItem) => childItem.id === id);
      if (child) {
        child.title = newName;
        const options = { numeric: true, sensitivity: "base" as const };
        group.children.sort((childA, childB) =>
          childA.title.localeCompare(childB.title, undefined, options),
        );
        break;
      }
    }
    const view = opened_views.value.find((openedView: ReadonlyOpenedView) => openedView.id === id);
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
    rowHeights,
    addItem,
    removeItem,
    renameItem,
    displayAdditionalTree,
    closeView,
    toggleView,
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
