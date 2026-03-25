// Third party imports
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { database } from "@ogw_internal/database/database.js";
import { useViewerStore } from "@ogw_front/stores/viewer";

const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic;

export const useDataStore = defineStore("data", () => {
  const viewerStore = useViewerStore();

  async function item(id) {
    const data_item = await database.data.get(id);
    if (!data_item) {
      throw new Error(`Item not found: ${id}`);
    }
    return data_item;
  }

  function refItem(id) {
    return useObservable(
      liveQuery(() => database.data.get(id)),
      { initialValue: {} },
    );
  }

  function refAllItems() {
    return useObservable(
      liveQuery(() => database.data.toArray()),
      { initialValue: [] },
    );
  }

  async function formatedMeshComponents(modelId) {
    const items = await database.model_components.where("id").equals(modelId).toArray();
    const componentTitles = {
      Corner: "Corners",
      Line: "Lines",
      Surface: "Surfaces",
      Block: "Blocks",
    };

    const componentsByType = {};
    for (const component_item of items) {
      if (componentTitles[component_item.type]) {
        if (!componentsByType[component_item.type]) {
          componentsByType[component_item.type] = [];
        }
        componentsByType[component_item.type].push(component_item);
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
      }));
  }

  function refFormatedMeshComponents(id_ref) {
    return useObservable(
      liveQuery(() => {
        const unwrapped_id = isRef(id_ref) ? id_ref.value : id_ref;
        return formatedMeshComponents(unwrapped_id);
      }),
      { initialValue: [] },
    );
  }

  async function meshComponentType(modelId, geode_id) {
    const component = await database.model_components
      .where("[id+geode_id]")
      .equals([modelId, geode_id])
      .first();
    return component?.type;
  }

  async function registerObject(id) {
    return await viewerStore.request(viewer_generic_schemas.register, { id });
  }

  async function deregisterObject(id) {
    return await viewerStore.request(viewer_generic_schemas.deregister, { id });
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
    };
    return database.data.put(itemData);
  }

  function addComponents(new_item) {
    const allComponents = [];
    function addModelComponents(components) {
      for (const component of components) {
        allComponents.push({
          id: new_item.id,
          geode_id: component.geode_id,
          type: component.type,
          viewer_id: component.viewer_id,
          name: component.name,
        });
      }
    }
    addModelComponents(new_item.mesh_components);
    addModelComponents(new_item.collection_components);
    return database.model_components.bulkPut(allComponents);
  }

  function addComponentRelations(new_item) {
    const relations = [];
    function addModelComponentRelations(components, parent, type) {
      for (const child of components) {
        relations.push({
          id: new_item.id,
          parent,
          child,
          type,
        });
      }
    }
    for (const component of new_item.mesh_components) {
      if (component.boundaries) {
        addModelComponentRelations(component.boundaries, component.geode_id, "boundary");
      }
      if (component.internals) {
        addModelComponentRelations(component.internals, component.geode_id, "internal");
      }
    }
    for (const component of new_item.collection_components) {
      if (component.items) {
        addModelComponentRelations(component.items, component.geode_id, "collection");
      }
    }
    return database.model_components_relation.bulkPut(relations);
  }

  async function deleteItem(id) {
    await database.data.delete(id);
    await deleteModelComponents(id);
  }

  async function updateItem(id, changes) {
    await database.data.update(id, changes);
  }

  async function deleteModelComponents(modelId) {
    await database.model_components.where("id").equals(modelId).delete();
    await database.model_components_relation.where("id").equals(modelId).delete();
  }

  async function getMeshComponentGeodeIds(modelId, component_type) {
    const components = await database.model_components
      .where("[id+type]")
      .equals([modelId, component_type])
      .toArray();
    return components.map((component) => component.geode_id);
  }

  async function getCornersGeodeIds(modelId) {
    return await getMeshComponentGeodeIds(modelId, "Corner");
  }

  async function getLinesGeodeIds(modelId) {
    return await getMeshComponentGeodeIds(modelId, "Line");
  }

  async function getSurfacesGeodeIds(modelId) {
    return await getMeshComponentGeodeIds(modelId, "Surface");
  }

  async function getBlocksGeodeIds(modelId) {
    return await getMeshComponentGeodeIds(modelId, "Block");
  }

  async function getMeshComponentsViewerIds(modelId, meshComponentGeodeIds) {
    const components = await database.model_components
      .where("[id+geode_id]")
      .anyOf(meshComponentGeodeIds.map((geode_id) => [modelId, geode_id]))
      .toArray();
    return components.map((component) => Number.parseInt(component.viewer_id, 10));
  }

  async function exportStores() {
    const items = await database.data.toArray();
    return { items };
  }

  async function importStores(_snapshot) {
    await clear();
  }

  async function clear() {
    await database.data.clear();
  }

  return {
    refAllItems,
    item,
    refItem,
    meshComponentType,
    formatedMeshComponents,
    refFormatedMeshComponents,
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
    getMeshComponentGeodeIds,
    getMeshComponentsViewerIds,

    exportStores,
    importStores,
    clear,
  };
});
