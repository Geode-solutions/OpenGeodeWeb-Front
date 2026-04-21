import { defineStore } from "pinia";

import { ref, toRaw, watch } from "vue";
import { compareSelections } from "@ogw_front/utils/treeview";
import { database } from "@ogw_internal/database/database";
const PANEL_WIDTH = 300;

export const useTreeviewStore = defineStore("treeview", () => {
  const items = ref([]);
  const selection = ref([]);
  const opened_views = ref([
    { type: "object", id: "main", title: "Objects", scrollTop: 0, opened: [] },
  ]);
  const panelWidth = ref(PANEL_WIDTH);
  const additionalPanelWidth = ref(PANEL_WIDTH);
  const isImporting = ref(false);
  const pendingSelectionIds = ref([]);
  const rowHeights = ref([]);

  async function loadConfig() {
    try {
      const config = await database.treeview_config.get("main");
      if (config?.opened_views) {
        opened_views.value = config.opened_views;
      }
      if (config?.panelWidth) {
        panelWidth.value = config.panelWidth;
      }
      if (config?.additionalPanelWidth) {
        additionalPanelWidth.value = config.additionalPanelWidth;
      }
      if (config?.selectionIds) {
        selection.value = config.selectionIds;
      }
      if (config?.rowHeights) {
        rowHeights.value = config.rowHeights;
      }
    } catch (error) {
      console.error("Failed to load treeview config:", error);
    }
  }
  loadConfig();

  watch(
    [opened_views, panelWidth, additionalPanelWidth, selection, rowHeights],
    () => {
      database.treeview_config.put({
        id: "main",
        opened_views: toRaw(opened_views.value),
        panelWidth: panelWidth.value,
        additionalPanelWidth: additionalPanelWidth.value,
        selectionIds: toRaw(selection.value),
        rowHeights: toRaw(rowHeights.value),
      });
    },
    { deep: true },
  );

  watch(selection, (current, previous) => {
    const { removed } = compareSelections(current, previous);
    for (const id of removed) {
      const index = opened_views.value.findIndex(
        (view) => view.type === "component" && view.id === id,
      );
      if (index !== -1) {
        closeView(index);
      }
    }
  });

  function closeView(index) {
    if (index > 0) {
      opened_views.value = opened_views.value.filter((_, i) => i !== index);
    }
  }

  function addItem(geodeObjectType, name, id, viewer_type) {
    const child = { title: name, id, viewer_type, geode_object_type: geodeObjectType };
    let found = false;
    for (const item of items.value) {
      if (item.title === geodeObjectType) {
        item.children.push(child);
        const opt = { numeric: true, sensitivity: "base" };
        item.children.sort((childA, childB) =>
          childA.title.localeCompare(childB.title, undefined, opt),
        );
        found = true;
        break;
      }
    }
    if (!found) {
      items.value.push({ id: geodeObjectType, title: geodeObjectType, children: [child] });
      const sortOpt = { numeric: true, sensitivity: "base" };
      items.value.sort((groupA, groupB) =>
        groupA.title.localeCompare(groupB.title, undefined, sortOpt),
      );
    }
    selection.value = [...selection.value, id];
  }

  function removeItem(id) {
    for (let index = 0; index < items.value.length; index += 1) {
      const group = items.value[index];
      const childIndex = group.children.findIndex((child) => child.id === id);
      if (childIndex !== -1) {
        group.children.splice(childIndex, 1);
        if (group.children.length === 0) {
          items.value.splice(index, 1);
        }
        selection.value = selection.value.filter((s_id) => s_id !== id);
        return;
      }
    }
  }

  function displayAdditionalTree(id, title, geodeObjectType) {
    const index = opened_views.value.findIndex((view) => view.id === id);
    if (index !== -1) {
      return closeView(index);
    }
    additionalPanelWidth.value = panelWidth.value;
    opened_views.value.push({
      type: "component",
      id,
      title: title || id,
      geode_object_type: geodeObjectType,
      scrollTop: 0,
      opened: [],
    });
  }

  function moveView(fromIdx, toIdx) {
    if (fromIdx !== 0 && toIdx !== 0) {
      const [element] = opened_views.value.splice(fromIdx, 1);
      opened_views.value.splice(toIdx, 0, element);
    }
  }

  function importStores(snapshot) {
    opened_views.value = snapshot?.opened_views || [
      { type: "object", id: "main", title: "Objects", scrollTop: 0, opened: [] },
    ];
    panelWidth.value = snapshot?.panelWidth || PANEL_WIDTH;
    additionalPanelWidth.value = snapshot?.additionalPanelWidth || PANEL_WIDTH;
    rowHeights.value = snapshot?.rowHeights || [];
    pendingSelectionIds.value =
      snapshot?.selectionIds ||
      (snapshot?.selection || []).map((selectionItem) => selectionItem.id || selectionItem) ||
      [];
  }

  function finalizeImportSelection() {
    const rebuilt = [];
    for (const group of items.value) {
      for (const child of group.children) {
        if (
          pendingSelectionIds.value.length === 0 ||
          pendingSelectionIds.value.includes(child.id)
        ) {
          rebuilt.push(child.id || child);
        }
      }
    }
    selection.value = rebuilt;
    pendingSelectionIds.value = [];
  }

  function clear() {
    items.value = [];
    selection.value = [];
    pendingSelectionIds.value = [];
    opened_views.value = [
      { type: "object", id: "main", title: "Objects", scrollTop: 0, opened: [] },
    ];
  }

  function displayFileTree() {
    opened_views.value = [
      { type: "object", id: "main", title: "Objects", scrollTop: 0, opened: [] },
    ];
  }

  function setPanelWidth(width) {
    panelWidth.value = width;
  }

  function setAdditionalPanelWidth(width) {
    additionalPanelWidth.value = width;
  }

  function setScrollTop(viewId, scrollTop) {
    const view = opened_views.value.find((openedView) => openedView.id === viewId);
    if (view) {
      view.scrollTop = scrollTop;
    }
  }

  function setOpened(viewId, opened) {
    const view = opened_views.value.find((openedView) => openedView.id === viewId);
    if (view) {
      view.opened = opened;
    }
  }

  function setRowHeights(heights) {
    rowHeights.value = heights;
  }

  function exportStores() {
    return {
      opened_views: opened_views.value,
      panelWidth: panelWidth.value,
      additionalPanelWidth: additionalPanelWidth.value,
      selectionIds: selection.value,
      rowHeights: rowHeights.value,
    };
  }

  return {
    items,
    selection,
    opened_views,
    panelWidth,
    additionalPanelWidth,
    isImporting,
    rowHeights,
    addItem,
    removeItem,
    displayAdditionalTree,
    closeView,
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
