// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import { database } from "@/internal/database/database.js"
import { liveQuery } from "dexie"
import { useObservable } from "@vueuse/rxjs"

// Local constants
const back_model_schemas = back_schemas.opengeodeweb_back.models
const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic

import { useViewerStore } from "@ogw_front/stores/viewer"
import { useGeodeStore } from "@ogw_front/stores/geode"

export const useDataStore = defineStore("data", () => {
  const viewerStore = useViewerStore()

  function getAllItems() {
    return useObservable(
      liveQuery(() => database.data.toArray()),
      { initialValue: [] },
    )
  }

  function getItem(id) {
    if (!id) {
      return useObservable(
        liveQuery(() => null),
        { initialValue: {} },
      )
    }
    return useObservable(
      liveQuery(() => database.data.get(id)),
      { initialValue: {} },
    )
  }

  async function getItemAsync(id) {
    if (!id) return null
    return await database.data.get(id)
  }

  async function getAllItemsAsync() {
    return await database.data.toArray()
  }

  function formatedMeshComponents(id) {
    const item = getItem(id).value
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    const formated_mesh_components = []

    for (const [category, uuids] of Object.entries(mesh_components)) {
      formated_mesh_components.push({
        id: category,
        title: category,
        children: uuids.map((uuid) => ({
          id: uuid,
          title: uuid,
          category,
        })),
      })
    }
    return formated_mesh_components
  }

  function meshComponentType(id, uuid) {
    const item = getItem(id).value
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
      ...value,
      id,
      name: value.name || id,
      geode_object_type: value.geode_object_type,
      visible: value.visible !== undefined ? value.visible : true,
      created_at: value.created_at || new Date().toISOString(),
    }

    const serializedData = JSON.parse(JSON.stringify(itemData))
    await database.data.put(serializedData)
  }

  async function deleteItem(id) {
    await database.data.delete(id)
  }

  async function updateItem(id, changes) {
    await database.data.update(id, changes)
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
    const item = getItem(id).value
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    return Object.values(mesh_components["Corner"] || {})
  }

  function getLinesUuids(id) {
    const item = getItem(id).value
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    return Object.values(mesh_components["Line"] || {})
  }
  function getSurfacesUuids(id) {
    const item = getItem(id).value
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    return Object.values(mesh_components["Surface"] || {})
  }
  function getBlocksUuids(id) {
    const item = getItem(id).value
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    return Object.values(mesh_components["Block"] || {})
  }

  function getFlatIndexes(id, mesh_component_ids) {
    const item = getItem(id).value
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
    const items = await getAllItemsAsync()
    return { items }
  }

  async function importStores(snapshot) {
    await clear()
  }

  async function clear() {
    await database.data.clear()
  }

  return {
    getAllItems,
    getAllItemsAsync,
    getItem,
    getItemAsync,
    meshComponentType,
    formatedMeshComponents,
    registerObject,
    deregisterObject,
    addItem,
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
