// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import { db } from "@ogw_f/composables/db.js"

// Local constants
const back_model_schemas = back_schemas.opengeodeweb_back.models
const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic

export const useDataBaseStore = defineStore("dataBase", () => {
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
    return viewer_call({
      schema: viewer_generic_schemas.register,
      params: { id },
    })
  }

  async function deregisterObject(id) {
    return viewer_call({
      schema: viewer_generic_schemas.deregister,
      params: { id },
    })
  }

  async function addItem(id, value) {
    const itemData = {
      id,
      visible: true,
      created_at: new Date().toISOString(),
      ...value,
    }

    await db.importedData.put(itemData)
    db_cache[id] = itemData
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

  // Folder management
  async function createFolder(name, parent_id = null) {
    const folder = {
      name,
      parent_id,
      created_at: new Date().toISOString(),
    }
    const id = await db.folders.add(folder)
    return { ...folder, id }
  }

  async function deleteFolder(id) {
    await db.folders.delete(id)
    await db.importedData.where("folder_id").equals(id).modify({ folder_id: null })
    Object.values(db_cache).forEach((item) => {
      if (item.folder_id === id) item.folder_id = null
    })
  }

  async function getAllFolders() {
    return await db.folders.toArray()
  }

  async function updateFolder(id, changes) {
    await db.folders.update(id, changes)
  }

  // Tag management
  async function addTag(itemId, tag) {
    const item = await itemMetaDatas(itemId)
    const tags = item.tags || []
    if (!tags.includes(tag)) {
      tags.push(tag)
      await updateItem(itemId, { tags })
    }
  }

  async function removeTag(itemId, tag) {
    const item = await itemMetaDatas(itemId)
    const tags = (item.tags || []).filter((t) => t !== tag)
    await updateItem(itemId, { tags })
  }

  async function togglePin(itemId) {
    const item = await db.importedData.get(itemId)
    if (item) {
      await updateItem(itemId, { pinned: !item.pinned })
    }
  }

  async function batchAddTags(itemIds, tags) {
    for (const id of itemIds) {
      const item = await db.importedData.get(id)
      if (item) {
        const newTags = [...new Set([...(item.tags || []), ...tags])]
        await updateItem(id, { tags: newTags })
      }
    }
  }

  async function batchRemoveTags(itemIds, tags) {
    for (const id of itemIds) {
      const item = await db.importedData.get(id)
      if (item) {
        const newTags = (item.tags || []).filter(t => !tags.includes(t))
        await updateItem(id, { tags: newTags })
      }
    }
  }

  async function batchMoveToFolder(itemIds, folderId) {
    for (const id of itemIds) {
      await updateItem(id, { folder_id: folderId })
    }
  }

  async function batchUpdateColor(itemIds, color) {
    const dataStyleStore = useDataStyleStore()
    for (const id of itemIds) {
      await dataStyleStore.updateStyle(id, { color })
    }
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
          const mesh_components = response._data.uuid_dict
          await updateItem(id, { mesh_components })
        },
      },
    )
  }

  async function fetchUuidToFlatIndexDict(id) {
    return api_fetch(
      {
        schema: back_model_schemas.vtm_component_indices,
        params: { id },
      },
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

  async function exportSelectedItems(itemIds) {
    const { exportProject } = useProjectManager()
    await exportProject({ itemIds })
  }

  async function exportStores(params = {}) {
    const items = await db.importedData.toArray()
    const folders = await db.folders.toArray()
    const snapshotDb = {}

    const filteredItems = params.itemIds
      ? items.filter(item => params.itemIds.includes(item.id))
      : items

    for (const item of filteredItems) {
      if (!item || !item.id) continue
      snapshotDb[item.id] = {
        ...item,
      }
    }

    const filteredFolders = params.itemIds
      ? folders.filter(f => filteredItems.some(i => i.folder_id === f.id))
      : folders

    return { db: snapshotDb, folders: filteredFolders }
  }

  async function importStores(snapshot) {
    const hybridViewerStore = useHybridViewerStore()
    await hybridViewerStore.initHybridViewer()
    hybridViewerStore.clear()

    await db.importedData.clear()
    await db.folders.clear()
    Object.keys(db_cache).forEach((key) => delete db_cache[key])

    if (snapshot?.folders) {
      for (const folder of snapshot.folders) {
        await db.folders.put(folder)
      }
    }

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
    createFolder,
    deleteFolder,
    getAllFolders,
    updateFolder,
    addTag,
    removeTag,
    togglePin,
    batchAddTags,
    batchRemoveTags,
    batchMoveToFolder,
    batchUpdateColor,
    exportSelectedItems,
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
