// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { databaseRef } from "../../internal/database/database.js"
import { liveQuery } from "dexie"
import { computed, ref, watch } from "vue"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useViewerStore } from "@ogw_front/stores/viewer"

const back_model_schemas = back_schemas.opengeodeweb_back.models
const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic

export const useDataStore = defineStore("data", () => {
  const viewerStore = useViewerStore()

  const itemCache = new Map()
  function getItem(id) {
    if (!id) {
      const emptyRef = ref({})
      emptyRef.fetch = async () => ({})
      return emptyRef
    }
    if (itemCache.has(id)) {
      return itemCache.get(id)
    }

    const item = ref({})
    let sub = null
    const update = () => {
      if (sub) sub.unsubscribe()
      sub = liveQuery(() => databaseRef.value.data.get(id)).subscribe((val) => {
        item.value = val || {}
      })
    }
    watch(databaseRef, update, { immediate: true })

    item.fetch = () => databaseRef.value.data.get(id)
    itemCache.set(id, item)
    return item
  }

  function getAllItems() {
    const items = ref([])
    let sub = null
    const update = () => {
      if (sub) sub.unsubscribe()
      sub = liveQuery(() => databaseRef.value.data.toArray()).subscribe((val) => {
        items.value = val || []
      })
    }
    watch(databaseRef, update, { immediate: true })

    items.fetch = () => databaseRef.value.data.toArray()
    return items
  }

  async function formatedMeshComponents(id) {
    const items = await databaseRef.value.model_components.where({ id }).toArray()
    const distinctTypes = [...new Set(items.map((item) => item.type))]

    const formated_mesh_components = await Promise.all(
      distinctTypes.map(async (type) => {
        const meshComponents = await databaseRef.value.model_components
          .where({ id, type })
          .toArray()

        return {
          id: type,
          title: type,
          children: meshComponents.map((meshComponent) => ({
            id: meshComponent.geode_id,
            title: meshComponent.name,
            category: meshComponent.type,
          })),
        }
      }),
    )

    return formated_mesh_components
  }

  async function meshComponentType(id, geode_id) {
    const component = await databaseRef.value.model_components
      .where({ id, geode_id })
      .first()
    return component?.type
  }

  async function registerObject(id) {
    return await viewerStore.request(viewer_generic_schemas.register, { id })
  }

  async function deregisterObject(id) {
    return await viewerStore.request(viewer_generic_schemas.deregister, { id })
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

    const serializedData = structuredClone(itemData)
    await databaseRef.value.data.put(serializedData)
  }
  async function deleteItem(id) {
    await databaseRef.value.data.delete(id)
    await deleteModelComponents(id)
  }
  async function updateItem(id, changes) {
    await databaseRef.value.data.update(id, changes)
  }

  async function addModelComponents(values) {
    if (!values || values.length === 0) {
      console.debug("[addModelComponents] No mesh components to add")
      return
    }
    for (const value of values) {
      value.created_at = new Date().toISOString()
    }
    const serializedData = structuredClone(values)
    await databaseRef.value.model_components.bulkAdd(serializedData)
  }

  async function deleteModelComponents(id) {
    await databaseRef.value.model_components.where({ id }).delete()
  }

  async function fetchMeshComponents(id) {
    const geodeStore = useGeodeStore()
    return await geodeStore.request(
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
    const components = await databaseRef.value.model_components
      .where({ id, type: meshComponentType })
      .toArray()
    return components.map((component) => component.geode_id)
  }

  async function getCornersGeodeIds(id) {
    return await getMeshComponentGeodeIds(id, "Corner")
  }

  async function getLinesGeodeIds(id) {
    return await getMeshComponentGeodeIds(id, "Line")
  }

  async function getSurfacesGeodeIds(id) {
    return await getMeshComponentGeodeIds(id, "Surface")
  }

  async function getBlocksGeodeIds(id) {
    return await getMeshComponentGeodeIds(id, "Block")
  }

  async function getMeshComponentsViewerIds(id, meshComponentGeodeIds) {
    const components = await databaseRef.value.model_components
      .where("id")
      .equals(id)
      .and((component) => meshComponentGeodeIds.includes(component.geode_id))
      .toArray()
    return components.map((component) => component.viewer_id)
  }

  async function exportStores() {
    const items = await getAllItems().fetch()
    return { items }
  }

  async function importStores(_snapshot) {
    await clear()
  }

  async function clear() {
    await databaseRef.value.data.clear()
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
