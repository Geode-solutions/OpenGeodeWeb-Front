// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import { db } from "@ogw_front/composables/db.js"

// Local constants
const back_model_schemas = back_schemas.opengeodeweb_back.models
const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic

import { useViewerStore } from "@ogw_front/stores/viewer"
import { useGeodeStore } from "@ogw_front/stores/geode"

export const useDataBaseStore = defineStore("dataBase", () => {
  const viewerStore = useViewerStore()
  const db_cache = reactive({})

  async function itemMetaDatas(id) {
    if (db_cache[id]) {
      return db_cache[id]
    }
    const item = await db.importedData.get(id)
    if (item) {
      db_cache[id] = item
    }
    return item
  }

  function itemMetaDatasSync(id) {
    return db_cache[id]
  }

  function formatedMeshComponents(id) {
    const item = itemMetaDatasSync(id)
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
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
    const item = itemMetaDatasSync(id)
    if (!item || !item.mesh_components) return null
    const { mesh_components } = item

    if (mesh_components["Corner"]?.includes(uuid)) return "corner"
    else if (mesh_components["Line"]?.includes(uuid)) return "line"
    else if (mesh_components["Surface"]?.includes(uuid)) return "surface"
    else if (mesh_components["Block"]?.includes(uuid)) return "block"
    return null
  }

  async function registerObject(id) {
    return viewerStore.request(viewer_generic_schemas.register, { id })
  }

  async function deregisterObject(id) {
    return viewerStore.request(viewer_generic_schemas.deregister, { id })
  }

  async function addItem(id, value) {
    const itemData = {
      id,
      name: value.name || value.displayed_name || id,
      geode_object_type:
        value.geode_object_type || value.geode_object || "Unknown",
      visible: true,
      created_at: new Date().toISOString(),
      ...value,
    }

    const serializedData = JSON.parse(JSON.stringify(itemData))
    await db.importedData.put(serializedData)
    db_cache[id] = serializedData
  }

  async function getAllItems() {
    const items = await db.importedData.toArray()
    items.forEach((item) => {
      db_cache[item.id] = item
    })
    return items
  }

  async function deleteItem(id) {
    await db.importedData.delete(id)
    delete db_cache[id]
  }

  async function updateItem(id, changes) {
    await db.importedData.update(id, changes)
    if (db_cache[id]) {
      Object.assign(db_cache[id], changes)
    }
  }

  async function fetchMeshComponents(id) {
    const geodeStore = useGeodeStore()
    return geodeStore.request(
      back_model_schemas.mesh_components,
      { id },
      {
        response_function: async (response) => {
          const mesh_components = response._data.uuid_dict
          await updateItem(id, { mesh_components })
        },
      },
    )
  }

  async function fetchUuidToFlatIndexDict(id) {
    const geodeStore = useGeodeStore()
    return geodeStore.request(
      back_model_schemas.vtm_component_indices,
      { id },
      {
        response_function: async (response) => {
          const uuid_to_flat_index = response._data.uuid_to_flat_index
          await updateItem(id, { uuid_to_flat_index })
        },
      },
    )
  }

  function getCornersUuids(id) {
    const item = itemMetaDatasSync(id)
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    return Object.values(mesh_components["Corner"] || {})
  }

  function getLinesUuids(id) {
    const item = itemMetaDatasSync(id)
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    return Object.values(mesh_components["Line"] || {})
  }
  function getSurfacesUuids(id) {
    const item = itemMetaDatasSync(id)
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    return Object.values(mesh_components["Surface"] || {})
  }
  function getBlocksUuids(id) {
    const item = itemMetaDatasSync(id)
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    return Object.values(mesh_components["Block"] || {})
  }

  function getFlatIndexes(id, mesh_component_ids) {
    const item = itemMetaDatasSync(id)
    if (!item || !item.uuid_to_flat_index) return []
    const { uuid_to_flat_index } = item
    const flat_indexes = []
    for (const mesh_component_id of mesh_component_ids) {
      if (uuid_to_flat_index[mesh_component_id] !== undefined) {
        flat_indexes.push(uuid_to_flat_index[mesh_component_id])
      }
    }
    return flat_indexes
  }

  async function exportStores() {
    const items = await db.importedData.toArray()
    const snapshotDb = {}

    for (const item of items) {
      snapshotDb[item.id] = { ...item }
    }

    return { db: snapshotDb }
  }

  async function importStores(snapshot) {
    const hybridViewerStore = useHybridViewerStore()
    await hybridViewerStore.initHybridViewer()
    hybridViewerStore.clear()

    await db.importedData.clear()
    Object.keys(db_cache).forEach((key) => delete db_cache[key])

    for (const [id, item] of Object.entries(snapshot?.db || {})) {
      await registerObject(id)
      await addItem(id, item)
    }
  }

  async function clear() {
    await db.importedData.clear()
    Object.keys(db_cache).forEach((key) => delete db_cache[key])
  }

  return {
    db: db_cache,
    itemMetaDatas,
    itemMetaDatasSync,
    meshComponentType,
    formatedMeshComponents,
    registerObject,
    deregisterObject,
    addItem,
    getAllItems,
    deleteItem,
    updateItem,
    fetchUuidToFlatIndexDict,
    fetchMeshComponents,
    getCornersUuids,
    getLinesUuids,
    getSurfacesUuids,
    getBlocksUuids,
    getFlatIndexes,
    exportStores,
    importStores,
    clear,
  }
})
