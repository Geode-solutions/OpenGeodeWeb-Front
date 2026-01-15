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

  function getItem(id) {
    if (!id) {
      const emptyRef = ref({})
      emptyRef.fetch = async () => null
      return emptyRef
    }
    const observable = useObservable(
      liveQuery(() => database.data.get(id)),
      { initialValue: {} },
    )
    observable.fetch = async () => await database.data.get(id)
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

  function formatedMeshComponents(id) {
    const item = getItem(id).value
    if (!item || !item.mesh_components) return []
    const { mesh_components } = item
    const formated_mesh_components = []

    for (const [category, GeodeIds] of Object.entries(mesh_components)) {
      formated_mesh_components.push({
        id: category,
        title: category,
        children: GeodeIds.map((uuid) => ({
          id: uuid,
          title: uuid,
          category,
        })),
      })
    }
    return formated_mesh_components
  }

  async function meshComponentType(id, geode_id) {
    return database.model_components.get({ id, geode_id })
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
    console.log(updateItem.name, { id, changes })
    await database.data.update(id, changes)
  }

  async function addModelComponent(value) {
    const serializedData = JSON.parse(JSON.stringify(value))
    await database.model_components.put(serializedData)
  }

  async function fetchMeshComponents(id) {
    const geodeStore = useGeodeStore()
    return geodeStore.request(
      back_model_schemas.mesh_components,
      { id },
      {
        response_function: async (response) => {
          const { mesh_components } = response._data
          for (const mesh_component of mesh_components) {
            await addModelComponent(mesh_component)
          }
        },
      },
    )
  }

  async function getMeshComponentGeodeIds(id, meshComponentType) {
    console.log(getMeshComponentGeodeIds.name, { id, meshComponentType })
    return (
      await database.model_components
        .where({ id, type: meshComponentType })
        .toArray()
    ).map((component) => component.geode_id)
  }

  async function getCornersGeodeIds(id) {
    console.log(getCornersGeodeIds.name, { id })
    return getMeshComponentGeodeIds(id, "Corner")
  }

  async function getLinesGeodeIds(id) {
    console.log(getLinesGeodeIds.name, { id })
    return getMeshComponentGeodeIds(id, "Line")
  }

  async function getSurfacesGeodeIds(id) {
    console.log(getSurfacesGeodeIds.name, { id })
    return getMeshComponentGeodeIds(id, "Surface")
  }

  async function getBlocksGeodeIds(id) {
    console.log(getBlocksGeodeIds.name, { id })
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
    addModelComponent,
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
