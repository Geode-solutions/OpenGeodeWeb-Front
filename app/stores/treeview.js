const PANEL_WIDTH = 300;

export const useTreeviewStore = defineStore("treeview", () => {
  const items = ref([]);
  const selection = ref([]);
  const opened_views = ref([{ type: "object", id: "main", title: "Objects" }]);
  const panelWidth = ref(PANEL_WIDTH);
  const additionalPanelWidth = ref(PANEL_WIDTH);
  const isImporting = ref(false);
  const pendingSelectionIds = ref([]);

  function closeView(index) {
    if (index > 0) {
      opened_views.value.splice(index, 1);
    }
  }

  function addItem(geodeObjectType, name, id, viewerType) {
    const child = { title: name, id, viewerType, geode_object_type: geodeObjectType };
    let found = false;
    for (const item of items.value) {
      if (item.title === geodeObjectType) {
        item.children.push(child);
        const opt = { numeric: true, sensitivity: "base" };
        item.children.sort((el1, el2) => el1.title.localeCompare(el2.title, undefined, opt));
        found = true;
        break;
      }
    }
    if (!found) {
      items.value.push({ id: geodeObjectType, title: geodeObjectType, children: [child] });
      const sortOpt = { numeric: true, sensitivity: "base" };
      items.value.sort((el1, el2) => el1.title.localeCompare(el2.title, undefined, sortOpt));
    }
    selection.value.push(id);
  }

  function removeItem(id) {
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

  function displayAdditionalTree(id, title, geodeObjectType) {
    const idx = opened_views.value.findIndex((view) => view.id === id);
    if (idx !== -1) {
      return closeView(idx);
    }
    additionalPanelWidth.value = panelWidth.value;
    opened_views.value.push({
      type: "component",
      id,
      title: title || id,
      geode_object_type: geodeObjectType,
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
      { type: "object", id: "main", title: "Objects" },
    ];
    panelWidth.value = snapshot?.panelWidth || PANEL_WIDTH;
    additionalPanelWidth.value = snapshot?.additionalPanelWidth || PANEL_WIDTH;
    pendingSelectionIds.value =
      snapshot?.selectionIds || (snapshot?.selection || []).map((sel) => sel.id || sel) || [];
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
    opened_views.value = [{ type: "object", id: "main", title: "Objects" }];
  }

  return {
    items,
    selection,
    opened_views,
    panelWidth,
    additionalPanelWidth,
    isImporting,
    addItem,
    removeItem,
    displayAdditionalTree,
    closeView,
    moveView,
    importStores,
    displayFileTree: () =>
      (opened_views.value = [{ type: "object", id: "main", title: "Objects" }]),
    setPanelWidth: (width) => (panelWidth.value = width),
    setAdditionalPanelWidth: (width) => (additionalPanelWidth.value = width),
    exportStores: () => ({
      opened_views: opened_views.value,
      panelWidth: panelWidth.value,
      additionalPanelWidth: additionalPanelWidth.value,
      selectionIds: selection.value,
    }),
    finalizeImportSelection,
    clear,
  };
});
