import { defineStore } from "pinia"
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"
import { database } from "../../internal/database/database.js"
import { liveQuery } from "dexie"
import { useObservable } from "@vueuse/rxjs"

// Local constants
const back_model_schemas = back_schemas.opengeodeweb_back.models
const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic

import { useViewerStore } from "@ogw_front/stores/viewer"
import { useGeodeStore } from "@ogw_front/stores/geode"

export const useDataStore = defineStore("data", () => {
  const viewerStore = useViewerStore()

  const itemCache = new Map()
  function getItem(id) {
    if (!id) {
      const emptyRef = ref({})
      emptyRef.fetch = async () => null
      return emptyRef
    }
    if (itemCache.has(id)) {
      return itemCache.get(id)
    }
    const observable = useObservable(
      liveQuery(() => database.data.get(id)),
      { initialValue: {} },
    )
    observable.fetch = async () => await database.data.get(id)
    itemCache.set(id, observable)
    return observable
  }

  function getAllItems() {
    const observable = useObservable(
      liveQuery(() => database.data.toArray()),
      { initialValue: [] },
    )
    observable.fetch = async () => await database.data.toArray()
    return observable
  }

  async function formatedMeshComponents(id) {
    const items = await database.model_components.where({ id }).toArray()
    const distinctTypes = [...new Set(items.map((item) => item.type))]
    const formated_mesh_components = []
    for (const type of distinctTypes) {
      const meshComponents = await database.model_components
        .where({ id, type })
        .toArray()

      formated_mesh_components.push({
        id: type,
        title: type,
        children: meshComponents.map((meshComponent) => ({
          id: meshComponent.geode_id,
          title: meshComponent.name,
          category: meshComponent.type,
        })),
      })
    }

    return formated_mesh_components
  }

  async function meshComponentType(id, geode_id) {
    return (
      await database.model_components.where({ id, geode_id }).toArray()
    ).map((component) => component.type)[0]
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
    await deleteModelComponents(id)
  }
  async function updateItem(id, changes) {
    await database.data.update(id, changes)
  }

  async function addModelComponents(values) {
    if (!values || values.length === 0) {
      console.debug("[addModelComponents] No mesh components to add")
      return
    }
    values.map((value) => {
      value.created_at = new Date().toISOString()
    })
    const serializedData = JSON.parse(JSON.stringify(values))
    await database.model_components.bulkAdd(serializedData)
  }

  async function deleteModelComponents(id) {
    await database.model_components.where({ id }).delete()
  }

  async function fetchMeshComponents(id) {
    const geodeStore = useGeodeStore()
    return geodeStore.request(
      back_model_schemas.mesh_components,
      { id },
      {
        response_function: async (response) => {
          const { mesh_components } = response
          await addModelComponents(mesh_components)
        },
      },
    )
  }

  async function getMeshComponentGeodeIds(id, meshComponentType) {
    return (
      await database.model_components
        .where({ id, type: meshComponentType })
        .toArray()
    ).map((component) => component.geode_id)
  }

  async function getCornersGeodeIds(id) {
    return getMeshComponentGeodeIds(id, "Corner")
  }

  async function getLinesGeodeIds(id) {
    return getMeshComponentGeodeIds(id, "Line")
  }

  async function getSurfacesGeodeIds(id) {
    return getMeshComponentGeodeIds(id, "Surface")
  }

  async function getBlocksGeodeIds(id) {
    return getMeshComponentGeodeIds(id, "Block")
  }

  async function getMeshComponentsViewerIds(id, meshComponentGeodeIds) {
    return (
      await database.model_components
        .where("id")
        .equals(id)
        .and((component) => meshComponentGeodeIds.includes(component.geode_id))
        .toArray()
    ).map((component) => component.viewer_id)
  }

  async function exportStores() {
    const items = await getAllItems().fetch()
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
    getItem,
    meshComponentType,
    formatedMeshComponents,
    registerObject,
    deregisterObject,
    addItem,
    deleteItem,
    updateItem,
    fetchMeshComponents,
    getCornersGeodeIds,
    getLinesGeodeIds,
    getSurfacesGeodeIds,
    getBlocksGeodeIds,
    getMeshComponentsViewerIds,
    exportStores,
    importStores,
    clear,
  }
})
