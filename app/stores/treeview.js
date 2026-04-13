import { defineStore } from "pinia";
import { ref } from "vue";

const PANEL_WIDTH = 300;

function addItemToItems(items, params) {
  const { geodeObjectType, name, id, viewerType } = params;
  const child = { title: name, id, viewerType, geode_object_type: geodeObjectType };
  for (const item of items.value) {
    if (item.title === geodeObjectType) {
      item.children.push(child);
      const opt = { numeric: true, sensitivity: "base" };
      item.children.sort((el1, el2) => el1.title.localeCompare(el2.title, undefined, opt));
      return;
    }
  }
  items.value.push({ id: geodeObjectType, title: geodeObjectType, children: [child] });
  const sortOpt = { numeric: true, sensitivity: "base" };
  items.value.sort((el1, el2) => el1.title.localeCompare(el2.title, undefined, sortOpt));
}

function removeItemFromItems(items, selection, id) {
  for (let i = 0; i < items.value.length; i += 1) {
    const group = items.value[i];
    const childIndex = group.children.findIndex((child) => child.id === id);
    if (childIndex !== -1) {
      group.children.splice(childIndex, 1);
      if (group.children.length === 0) {
        items.value.splice(i, 1);
      }
      const sIdx = selection.value.indexOf(id);
      if (sIdx !== -1) {
        selection.value.splice(sIdx, 1);
      }
      return;
    }
  }
}

function processImport(snapshot) {
  const views = snapshot?.opened_views || [{ type: "object", id: "main", title: "Objects" }];
  const pWidth = snapshot?.panelWidth || PANEL_WIDTH;
  const apWidth = snapshot?.additionalPanelWidth || PANEL_WIDTH;
  const ids = snapshot?.selectionIds || (snapshot?.selection || []).map((sel) => sel.id || sel) || [];
  return { opened_views: views, panelWidth: pWidth, additionalPanelWidth: apWidth, ids };
}

function finalizeRebuild(items, ids) {
  const rebuilt = [];
  for (const group of items.value) {
    for (const child of group.children) {
      if (ids.length === 0 || ids.includes(child.id)) {
        rebuilt.push(child.id || child);
      }
    }
  }
  return rebuilt;
}

function createActions(state) {
  const { items, selection, peek, panelWidth, additionalPanelWidth, pendingIds } = state;
  function closeView(index) {
    if (index > 0) {
      peek.value.splice(index, 1);
    }
  }
  return {
    addItem: (geodeObjectType, name, id, viewerType) => {
      addItemToItems(items, { geodeObjectType, name, id, viewerType });
      selection.value.push(id);
    },
    displayAdditionalTree: (id, title, geodeObjectType) => {
      const idx = peek.value.findIndex((view) => view.id === id);
      if (idx !== -1) {
        return closeView(idx);
      }
      additionalPanelWidth.value = panelWidth.value;
      peek.value.push({ type: "component", id, title: title || id, geode_object_type: geodeObjectType });
    },
    closeView,
    moveView: (fromIdx, toIdx) => {
      if (fromIdx !== 0 && toIdx !== 0) {
        const [element] = peek.value.splice(fromIdx, 1);
        peek.value.splice(toIdx, 0, element);
      }
    },
    importStores: (snapshot) => {
      const data = processImport(snapshot);
      peek.value = data.opened_views; panelWidth.value = data.panelWidth;
      additionalPanelWidth.value = data.additionalPanelWidth; pendingIds.value = data.ids;
    },
  };
}

export const useTreeviewStore = defineStore("treeview", () => {
  const items = ref([]);
  const selection = ref([]);
  const opened_views = ref([{ type: "object", id: "main", title: "Objects" }]);
  const panelWidth = ref(PANEL_WIDTH);
  const additionalPanelWidth = ref(PANEL_WIDTH);
  const isImporting = ref(false);
  const pendingSelectionIds = ref([]);

  const acts = createActions({ items, selection, peek: opened_views, panelWidth, additionalPanelWidth, pendingIds: pendingSelectionIds });

  return {
    ...acts,
    items, selection, opened_views, panelWidth, additionalPanelWidth, isImporting,
    removeItem: (id) => removeItemFromItems(items, selection, id),
    displayFileTree: () => (opened_views.value = [{ type: "object", id: "main", title: "Objects" }]),
    setPanelWidth: (width) => (panelWidth.value = width),
    setAdditionalPanelWidth: (width) => (additionalPanelWidth.value = width),
    exportStores: () => ({ opened_views: opened_views.value, panelWidth: panelWidth.value, additionalPanelWidth: additionalPanelWidth.value, selectionIds: selection.value }),
    finalizeImportSelection: () => {
      selection.value = finalizeRebuild(items, pendingSelectionIds.value);
      pendingSelectionIds.value = [];
    },
    clear: () => {
      items.value = []; selection.value = []; pendingSelectionIds.value = [];
      opened_views.value = [{ type: "object", id: "main", title: "Objects" }];
    },
  };
});
