export const useTreeviewStore = defineStore("treeview", () => {
  const items = ref([])
  const selection = ref([])
  const components_selection = ref([])
  const isAdditionnalTreeDisplayed = ref(false)
  const panelWidth = ref(300)
  const model_id = ref("")
  const isTreeCollection = ref(false)
  const selectedTree = ref(null)
  const isImporting = ref(false)
  const pendingSelectionIds = ref([])

  // /** Functions **/
  function addItem(geodeObject, displayed_name, id, object_type) {
    const child = { title: displayed_name, id, object_type }

    for (let i = 0; i < items.value.length; i++) {
      if (items.value[i].title === geodeObject) {
        items.value[i].children.push(child)
        items.value[i].children.sort((a, b) =>
          a.title.localeCompare(b.title, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )
        selection.value.push(child)
        return
      }
    }
    items.value.push({ title: geodeObject, children: [child] })
    selection.value.push(child)
  }

  function displayAdditionalTree(id) {
    isAdditionnalTreeDisplayed.value = true
    model_id.value = id
  }

  function displayFileTree() {
    isAdditionnalTreeDisplayed.value = false
  }

  function toggleTreeView() {
    isTreeCollection.value = !isTreeCollection.value
    console.log(
      "Switched to",
      isTreeCollection.value ? "TreeCollection" : "TreeComponent",
    )
  }

  function setPanelWidth(width) {
    panelWidth.value = width
  }

  function exportStores() {
    return {
      isAdditionnalTreeDisplayed: isAdditionnalTreeDisplayed.value,
      panelWidth: panelWidth.value,
      model_id: model_id.value,
      isTreeCollection: isTreeCollection.value,
      selectedTree: selectedTree.value,
      selectionIds: selection.value.map((c) => c.id),
    }
  }

  async function importStores(snapshot) {
    isAdditionnalTreeDisplayed.value =
      snapshot?.isAdditionnalTreeDisplayed || false
    panelWidth.value = snapshot?.panelWidth || 300
    model_id.value = snapshot?.model_id || ""
    isTreeCollection.value = snapshot?.isTreeCollection || false
    selectedTree.value = snapshot?.selectedTree || null

    pendingSelectionIds.value =
      snapshot?.selectionIds ||
      (snapshot?.selection || []).map((c) => c.id) ||
      []
  }

  function finalizeImportSelection() {
    const ids = pendingSelectionIds.value || []
    const rebuilt = []
    if (!ids.length) {
      for (const group of items.value) {
        for (const child of group.children) {
          rebuilt.push(child)
        }
      }
    } else {
      for (const group of items.value) {
        for (const child of group.children) {
          if (ids.includes(child.id)) {
            rebuilt.push(child)
          }
        }
      }
    }
    selection.value = rebuilt
    pendingSelectionIds.value = []
  }

  function updateItemName(id, newName) {
    for (const group of items.value) {
      const child = group.children.find((c) => c.id === id)
      if (child) {
        child.title = newName
        return
      }
    }
  }

  function removeItem(id) {
    for (const group of items.value) {
      const index = group.children.findIndex((c) => c.id === id)
      if (index !== -1) {
        group.children.splice(index, 1)
        if (group.children.length === 0) {
          const groupIndex = items.value.indexOf(group)
          items.value.splice(groupIndex, 1)
        }
        break
      }
    }
    selection.value = selection.value.filter((c) => c.id !== id)
  }

  function setItemVisibility(id, visible) {
    if (visible) {
      if (!selection.value.find((c) => c.id === id)) {
        for (const group of items.value) {
          const child = group.children.find((c) => c.id === id)
          if (child) {
            selection.value.push(child)
            return
          }
        }
      }
    } else {
      selection.value = selection.value.filter((c) => c.id !== id)
    }
  }

  const clear = () => {
    items.value = []
    selection.value = []
    components_selection.value = []
    pendingSelectionIds.value = []
    model_id.value = ""
    selectedTree.value = undefined
  }

  return {
    items,
    selection,
    components_selection,
    isAdditionnalTreeDisplayed,
    panelWidth,
    model_id,
    selectedTree,
    isImporting,
    addItem,
    displayAdditionalTree,
    displayFileTree,
    toggleTreeView,
    setPanelWidth,
    updateItemName,
    removeItem,
    setItemVisibility,
    exportStores,
    importStores,
    finalizeImportSelection,
    clear,
  }
})
