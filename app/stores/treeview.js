export const useTreeviewStore = defineStore("treeview", () => {
  const PANEL_WIDTH = 300;

  const items = ref([]);
  const selection = ref([]);
  const opened_views = ref([{ type: "object", id: "main", title: "Objects" }]);
  const panelWidth = ref(PANEL_WIDTH);
  const isImporting = ref(false);
  const pendingSelectionIds = ref([]);

  // /** Functions **/
  function addItem(geode_object_type, name, id, viewer_type) {
    const child = { title: name, id, viewer_type };

    for (let i = 0; i < items.value.length; i += 1) {
      if (items.value[i].title === geode_object_type) {
        items.value[i].children.push(child);
        items.value[i].children.sort((element1, element2) =>
          element1.title.localeCompare(element2.title, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        );
        selection.value.push(id);
        return;
      }
    }
    items.value.push({
      id: geode_object_type,
      title: geode_object_type,
      children: [child],
    });
    items.value.sort((element1, element2) =>
      element1.title.localeCompare(element2.title, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
    selection.value.push(id);
  }

  function displayAdditionalTree(id, title) {
    if (opened_views.value.some((view) => view.id === id)) {
      return;
    }
    opened_views.value.push({
      type: "component",
      id,
      title: title || id,
    });
  }

  function closeView(index) {
    if (index > 0) {
      opened_views.value.splice(index, 1);
    }
  }

  function moveView(fromIndex, toIndex) {
    if (fromIndex === 0 || toIndex === 0) {
      return;
    }
    const element = opened_views.value.splice(fromIndex, 1)[0];
    opened_views.value.splice(toIndex, 0, element);
  }

  function displayFileTree() {
    opened_views.value = [{ type: "object", id: "main", title: "Objects" }];
  }


  function setPanelWidth(width) {
    panelWidth.value = width;
  }

  function exportStores() {
    return {
      opened_views: opened_views.value,
      panelWidth: panelWidth.value,
      selectionIds: selection.value,
    };
  }

  function importStores(snapshot) {
    opened_views.value = snapshot?.opened_views || [{ type: "object", id: "main", title: "Objects" }];
    panelWidth.value = snapshot?.panelWidth || PANEL_WIDTH;

    pendingSelectionIds.value =
      snapshot?.selectionIds || (snapshot?.selection || []).map((sel) => sel.id || sel) || [];
  }

  function finalizeImportSelection() {
    const ids = pendingSelectionIds.value || [];
    const rebuilt = [];
    if (ids.length === 0) {
      for (const group of items.value) {
        for (const child of group.children) {
          rebuilt.push(child);
        }
      }
    } else {
      for (const group of items.value) {
        for (const child of group.children) {
          if (ids.includes(child.id)) {
            rebuilt.push(child.id);
          }
        }
      }
    }
    selection.value = rebuilt;
    pendingSelectionIds.value = [];
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

        const selectionIndex = selection.value.indexOf(id);
        if (selectionIndex !== -1) {
          selection.value.splice(selectionIndex, 1);
        }

        return;
      }
    }
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
    isImporting,
    addItem,
    removeItem,
    displayAdditionalTree,
    closeView,
    moveView,
    displayFileTree,
    setPanelWidth,
    exportStores,
    importStores,
    finalizeImportSelection,
    clear,
  };
});
