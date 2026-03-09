// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
import { database } from "@ogw_internal/database/database.js"
import { liveQuery } from "dexie"
import { useObservable } from "@vueuse/rxjs"
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

// Local imports
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useViewerStore } from "@ogw_front/stores/viewer"

const back_model_schemas = back_schemas.opengeodeweb_back.models
const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic

export const useDataStore = defineStore("data", () => {
  const viewerStore = useViewerStore()

  function item(id) {
    return database.data.get(id)
  }

  function refItem(id) {
    return useObservable(
      liveQuery(() => database.data.get(id)),
      { initialValue: {} },
    )
  }

  function refAllItems() {
    return useObservable(
      liveQuery(() => database.data.toArray()),
      { initialValue: [] },
    )
  }

  async function formatedMeshComponents(id) {
    const items = await database.model_components.where({ id }).toArray()
    const componentTitles = {
      Corner: "Corners",
      Line: "Lines",
      Surface: "Surfaces",
      Block: "Blocks",
    }

    const componentsByType = {}
    for (const component_item of items) {
      if (componentTitles[component_item.type]) {
        if (!componentsByType[component_item.type]) {
          componentsByType[component_item.type] = []
        }
        componentsByType[component_item.type].push(component_item)
      }
    }

    return Object.keys(componentTitles)
      .filter((type) => componentsByType[type])
      .map((type) => ({
        id: type,
        title: componentTitles[type],
        children: componentsByType[type].map((meshComponent) => ({
          id: meshComponent.geode_id,
          title: meshComponent.name,
          category: meshComponent.type,
        })),
      }))
  }

  async function meshComponentType(id, geode_id) {
    const component = await database.model_components
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

  function addItem(new_item) {
    const itemData = {
      id: new_item.id,
      name: new_item.name || new_item.id,
      viewer_type: new_item.viewer_type,
      geode_object_type: new_item.geode_object_type,
      visible: true,
      created_at: new Date().toISOString(),
      binary_light_viewable: new_item.binary_light_viewable,
    }
    return database.data.put(itemData)
  }

  function addComponents(new_item) {
    const allComponents = []
    for (const component of new_item.mesh_components) {
      component.id = new_item.id
      component.created_at = new Date().toISOString()
      if (component.boundaries) {
        delete component.boundaries
      }
      if (component.internals) {
        delete component.internals
      }
      allComponents.push(component)
    }
    for (const component of new_item.collection_components) {
      component.id = new_item.id
      component.created_at = new Date().toISOString()
      if (component.items) {
        delete component.items
      }
      allComponents.push(component)
    }
    return database.model_components.bulkPut(allComponents)
  }

  function addComponentRelations(new_item) {
    const relations = []
    for (const component of new_item.mesh_components) {
      if (component.boundaries) {
        for (const boundary_id of component.boundaries) {
          relations.push({
            id: new_item.id,
            parent: component.geode_id,
            child: boundary_id,
            type: "boundary",
          })
        }
      }
      if (component.internals) {
        for (const internal_id of component.internals) {
          relations.push({
            id: new_item.id,
            parent: component.geode_id,
            child: internal_id,
            type: "internal",
          })
        }
      }
    }
    for (const component of new_item.collection_components) {
      if (component.items) {
        for (const item_id of component.items) {
          relations.push({
            id: new_item.id,
            parent: component.geode_id,
            child: item_id,
            type: "collection",
          })
        }
      }
    }
    return database.model_components_relation.bulkPut(relations)
  }

  async function deleteItem(id) {
    await database.data.delete(id)
    await deleteModelComponents(id)
  }
  async function updateItem(id, changes) {
    await database.data.update(id, changes)
  }
  async function deleteModelComponents(id) {
    await database.model_components.where({ id }).delete()
    await database.model_components_relation.where({ id }).delete()
  }

  async function getMeshComponentGeodeIds(id, component_type) {
    const components = await database.model_components
      .where({ id, type: component_type })
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

  async function getMeshComponentsViewerIds(modelId, meshComponentGeodeIds) {
    const components = await database.model_components
      .where("[id+geode_id]")
      .anyOf(meshComponentGeodeIds.map((geode_id) => [modelId, geode_id]))
      .toArray()
    return components.map((component) => component.viewer_id)
  }

  async function exportStores() {
    const items = await database.data.toArray()
    return { items }
  }

  async function importStores(_snapshot) {
    await clear()
  }

  async function clear() {
    await database.data.clear()
  }

  return {
    refAllItems,
    item,
    refItem,
    meshComponentType,
    formatedMeshComponents,
    registerObject,
    deregisterObject,
    addItem,
    addComponents,
    addComponentRelations,
    deleteItem,
    updateItem,
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
