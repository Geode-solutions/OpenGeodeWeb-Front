export const useTreeviewStore = defineStore("treeview", () => {

  const PANEL_WIDTH = 300

  const items = ref([])
  const selection = ref([])
  const components_selection = ref([])
  const isAdditionnalTreeDisplayed = ref(false)
  const panelWidth = ref(PANEL_WIDTH)
  const model_id = ref("")
  const isTreeCollection = ref(false)
  const selectedTree = ref(null)
  const isImporting = ref(false)
  const pendingSelectionIds = ref([])

  // /** Functions **/
  function addItem(geode_object_type, name, id, viewer_type) {
    const child = { title: name, id, viewer_type }

    for (let i = 0; i < items.value.length; i += 1) {
      if (items.value[i].title === geode_object_type) {
        items.value[i].children.push(child)
        items.value[i].children.sort((element1, element2) =>
          element1.title.localeCompare(element2.title, undefined, {
            numeric: true,
            sensitivity: "base",
          }),
        )
        selection.value.push(child)
        return
      }
    }
    items.value.push({ title: geode_object_type, children: [child] })
    items.value.sort((element1, element2) =>
      element1.title.localeCompare(element2.title, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    )
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
    const selectionIds = selection.value.map((store) => store.id)
    return {
      isAdditionnalTreeDisplayed: isAdditionnalTreeDisplayed.value,
      panelWidth: panelWidth.value,
      model_id: model_id.value,
      isTreeCollection: isTreeCollection.value,
      selectedTree: selectedTree.value,
      selectionIds,
    }
  }

  async function importStores(snapshot) {
    isAdditionnalTreeDisplayed.value =
      snapshot?.isAdditionnalTreeDisplayed || false
    panelWidth.value = snapshot?.panelWidth || PANEL_WIDTH
    model_id.value = snapshot?.model_id || ""
    isTreeCollection.value = snapshot?.isTreeCollection || false
    selectedTree.value = snapshot?.selectedTree || null

    pendingSelectionIds.value =
      snapshot?.selectionIds ||
      (snapshot?.selection || []).map((store) => store.id) ||
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

  function removeItem(id) {
    for (let i = 0; i < items.value.length; i += 1) {
      const group = items.value[i]
      const childIndex = group.children.findIndex((child) => child.id === id)

      if (childIndex !== -1) {
        group.children.splice(childIndex, 1)

        if (group.children.length === 0) {
          items.value.splice(i, 1)
        }

        const selectionIndex = selection.value.findIndex(
          (item) => item.id === id,
        )
        if (selectionIndex !== -1) {
          selection.value.splice(selectionIndex, 1)
        }

        return
      }
    }
  }

  function clear() {
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
    removeItem,
    displayAdditionalTree,
    displayFileTree,
    toggleTreeView,
    setPanelWidth,
    exportStores,
    importStores,
    finalizeImportSelection,
    clear,
  }
})
