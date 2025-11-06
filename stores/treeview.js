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
  // Buffer pour reconstruire la sélection après que les items soient recréés
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
        // Ne pas polluer la sélection pendant import; on la reconstruit ensuite
        if (!isImporting.value) {
          selection.value.push(child)
        }
        return
      }
    }
    items.value.push({ title: geodeObject, children: [child] })
    if (!isImporting.value) {
      selection.value.push(child)
    }
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
      // Exporter uniquement les IDs pour éviter les problèmes de référence
      selectionIds: selection.value.map((c) => c.id),
    }
  }

  async function importStores(snapshot) {
    // Charger l’état UI
    isAdditionnalTreeDisplayed.value =
      snapshot?.isAdditionnalTreeDisplayed || false
    panelWidth.value = snapshot?.panelWidth || 300
    model_id.value = snapshot?.model_id || ""
    isTreeCollection.value = snapshot?.isTreeCollection || false
    selectedTree.value = snapshot?.selectedTree || null

    // Bufferiser les IDs de sélection (compat v1: snapshot.selection -> ids)
    pendingSelectionIds.value =
      snapshot?.selectionIds ||
      (snapshot?.selection || []).map((c) => c.id) ||
      []
  }

  // Appeler après import pour reconstruire la sélection à partir des items
  function finalizeImportSelection() {
    const ids = pendingSelectionIds.value || []
    const rebuilt = []
    for (const group of items.value) {
      for (const child of group.children) {
        if (ids.includes(child.id)) rebuilt.push(child)
      }
    }
    selection.value = rebuilt
    pendingSelectionIds.value = []
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
    exportStores,
    importStores,
    finalizeImportSelection,
  }
})
