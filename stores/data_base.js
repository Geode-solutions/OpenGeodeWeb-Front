// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local constants
const back_model_schemas = back_schemas.opengeodeweb_back.models
const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic

export const useDataBaseStore = defineStore("dataBase", () => {
  const db = reactive({})

  function itemMetaDatas(id) {
    return db[id]
  }

  function formatedMeshComponents(id) {
    const { mesh_components } = itemMetaDatas(id)
    const formated_mesh_components = ref([])

    for (const [category, uuids] of Object.entries(mesh_components)) {
      formated_mesh_components.value.push({
        id: category,
        title: category,
        children: uuids.map((uuid) => ({
          id: uuid,
          title: uuid,
          category,
        })),
      })
    }
    return formated_mesh_components.value
  }

  function meshComponentType(id, uuid) {
    const { mesh_components } = itemMetaDatas(id)

    if (mesh_components["Corner"]?.includes(uuid)) return "corner"
    else if (mesh_components["Line"]?.includes(uuid)) return "line"
    else if (mesh_components["Surface"]?.includes(uuid)) return "surface"
    else if (mesh_components["Block"]?.includes(uuid)) return "block"
    return null
  }

  async function registerObject(id) {
    return viewer_call({
      schema: viewer_generic_schemas.register,
      params: { id },
    })
  }

  const treeviewStore = useTreeviewStore()
  const hybridViewerStore = useHybridViewerStore()

  async function addItem(
    id,
    value = {
      object_type,
      geode_object,
      native_filename,
      viewable_filename,
      displayed_name,
      vtk_js: { binary_light_viewable },
    },
  ) {
    console.log("[DataBase] addItem start", {
      id,
      object_type: value.object_type,
      geode_object: value.geode_object,
    })
    db[id] = value

    if (value.object_type === "model") {
      await fetchMeshComponents(id)
      await fetchUuidToFlatIndexDict(id)
    }

    treeviewStore.addItem(
      value.geode_object,
      value.displayed_name,
      id,
      value.object_type,
    )
    console.log("[DataBase] addItem -> treeview.addItem done", id)

    console.log("[DataBase] addItem -> hybridViewer.addItem start", id)
    await hybridViewerStore.addItem(id)
    console.log("[DataBase] addItem -> hybridViewer.addItem done", id)
  }

  async function fetchMeshComponents(id) {
    return api_fetch(
      {
        schema: back_model_schemas.mesh_components,
        params: {
          id,
        },
      },
      {
        response_function: async (response) => {
          db[id].mesh_components = response._data.uuid_dict
        },
      },
    )
  }

  async function fetchUuidToFlatIndexDict(id) {
    console.log("fetchUuidToFlatIndexDict", id)
    return api_fetch(
      {
        schema: back_model_schemas.vtm_component_indices,
        params: { id },
      },
      {
        response_function: async (response) => {
          db[id]["uuid_to_flat_index"] = response._data.uuid_to_flat_index
        },
      },
    )
  }

  function exportStores() {
    const snapshotDb = {}
    for (const [id, item] of Object.entries(db)) {
      if (!item) continue
      snapshotDb[id] = {
        object_type: item.object_type,
        geode_object: item.geode_object,
        native_filename: item.native_filename,
        viewable_filename: item.viewable_filename,
        displayed_name: item.displayed_name,
        vtk_js: {
          binary_light_viewable: item?.vtk_js?.binary_light_viewable,
        },
      }
    }
    return { db: snapshotDb }
  }

  async function importStores(snapshot) {
    await hybridViewerStore.initHybridViewer()
    hybridViewerStore.clear()
    console.log(
      "[DataBase] importStores entries:",
      Object.keys(snapshot?.db || {}),
    )
    for (const [id, item] of Object.entries(snapshot?.db || {})) {
      await registerObject(id)
      await addItem(id, item)
    }
  }

  function getCornersUuids(id) {
    const { mesh_components } = itemMetaDatas(id)
    return Object.values(mesh_components["Corner"])
  }

  function getLinesUuids(id) {
    const { mesh_components } = itemMetaDatas(id)
    return Object.values(mesh_components["Line"])
  }
  function getSurfacesUuids(id) {
    const { mesh_components } = itemMetaDatas(id)
    return Object.values(mesh_components["Surface"])
  }
  function getBlocksUuids(id) {
    const { mesh_components } = itemMetaDatas(id)
    return Object.values(mesh_components["Block"])
  }

  function getFlatIndexes(id, mesh_component_ids) {
    const { uuid_to_flat_index } = itemMetaDatas(id)
    const flat_indexes = []
    for (const mesh_component_id of mesh_component_ids) {
      flat_indexes.push(uuid_to_flat_index[mesh_component_id])
    }
    return flat_indexes
  }

  return {
    db,
    itemMetaDatas,
    meshComponentType,
    formatedMeshComponents,
    registerObject,
    addItem,
    fetchUuidToFlatIndexDict,
    fetchMeshComponents,
    getCornersUuids,
    getLinesUuids,
    getSurfacesUuids,
    getBlocksUuids,
    getFlatIndexes,
    exportStores,
    importStores,
  }
})
