export const useTreeviewStore = defineStore("treeview", () => {
  const dataStyleStore = useDataStyleStore()

  /** State **/
  const items = ref([])
  const selection = ref([])
  const components_selection = ref([])
  const isAdditionnalTreeDisplayed = ref(false)
  const panelWidth = ref(300)
  const model_id = ref("")
  const isTreeCollection = ref(false)
  const selectedTree = ref(null)

  /** Functions **/
  function addItem(geodeObject, displayed_name, id, object_type, autoSelect = true) {
    dataStyleStore.addDataStyle(id, geodeObject, object_type)
    const child = { title: displayed_name, id, object_type }
    for (let i = 0; i < items.value.length; i++) {
      if (items.value[i].title === geodeObject) {
        items.value[i].children.push(child)
        if (autoSelect) selection.value.push(child)
        return
      }
    }
    items.value.push({ title: geodeObject, children: [child] })
    if (autoSelect) selection.value.push(child)
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

  function save() {
    return {
      isAdditionnalTreeDisplayed: isAdditionnalTreeDisplayed.value,
      panelWidth: panelWidth.value,
      model_id: model_id.value,
      isTreeCollection: isTreeCollection.value,
      selectedTree: selectedTree.value,
      selection: selection.value, // Keep for UX ?
    }
  }

  function load(snapshot) {
    selection.value = snapshot?.selection || []
    isAdditionnalTreeDisplayed.value =
      snapshot?.isAdditionnalTreeDisplayed || false
    panelWidth.value = snapshot?.panelWidth || 300
    model_id.value = snapshot?.model_id || ""
    isTreeCollection.value = snapshot?.isTreeCollection || false
    selectedTree.value = snapshot?.selectedTree || null
  }

  return {
    items,
    selection,
    components_selection,
    isAdditionnalTreeDisplayed,
    panelWidth,
    model_id,
    selectedTree,
    addItem,
    displayAdditionalTree,
    displayFileTree,
    toggleTreeView,
    setPanelWidth,
    save,
    load,
  }
})
