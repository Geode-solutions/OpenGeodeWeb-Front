// Third party imports
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { database } from "@ogw_internal/database/database.js";
import { useDataCollections } from "./data_helpers/collections.js";
import { useDataMesh } from "./data_helpers/mesh.js";
import { useViewerStore } from "@ogw_front/stores/viewer";

const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic;

// oxlint-disable-next-line max-lines-per-function, max-statements
export const useDataStore = defineStore("data", () => {
  const viewerStore = useViewerStore();
  const data_db = database.data;
  const model_components_db = database.model_components;
  const model_components_relation_db = database.model_components_relation;

  const {
    formatedMeshComponents,
    refFormatedMeshComponents,
    getMeshComponentsByType,
    getAllMeshComponents,
    fetchAllMeshComponents,
    getMeshComponentGeodeIds,
    getCornersGeodeIds,
    getLinesGeodeIds,
    getSurfacesGeodeIds,
    getBlocksGeodeIds,
  } = useDataMesh();

  const {
    hasCollectionComponents,
    getAllCollectionComponents,
    fetchAllCollectionComponents,
    formatedCollectionComponents,
    refFormatedCollectionComponents,
  } = useDataCollections();

  async function item(id) {
    const data_item = await data_db.get(id);
    if (!data_item) {
      throw new Error(`Item not found: ${id}`);
    }
    return data_item;
  }

  async function allItems() {
    return await data_db.toArray();
  }

  function refItem(id) {
    return useObservable(
      liveQuery(() => data_db.get(id)),
      { initialValue: {} },
    );
  }

  function refAllItems() {
    return useObservable(
      liveQuery(() => data_db.toArray()),
      { initialValue: [] },
    );
  }

  async function meshComponentType(modelId, geode_id) {
    const component = await model_components_db
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
    return data_db.put(itemData);
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
          is_active: component.is_active,
        });
      }
    }
    if (new_item.mesh_components) {
      addModelComponents(new_item.mesh_components);
    }
    if (new_item.collection_components) {
      addModelComponents(new_item.collection_components);
    }
    return model_components_db.bulkPut(allComponents);
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
    if (new_item.mesh_components) {
      for (const component of new_item.mesh_components) {
        if (component.boundaries) {
          addModelComponentRelations(component.boundaries, component.geode_id, "boundary");
        }
        if (component.internals) {
          addModelComponentRelations(component.internals, component.geode_id, "internal");
        }
      }
    }
    if (new_item.collection_components) {
      for (const component of new_item.collection_components) {
        if (component.items) {
          addModelComponentRelations(component.items, component.geode_id, "collection");
        }
      }
    }
    return model_components_relation_db.bulkPut(relations);
  }

  async function getComponentByViewerId(modelId, viewer_id) {
    const component = await model_components_db
      .where("viewer_id")
      .equals(Number(viewer_id))
      .and((model_component) => model_component.id === modelId)
      .first();
    return component;
  }

  async function deleteItem(id) {
    await data_db.delete(id);
    await deleteModelComponents(id);
  }

  async function updateItem(id, changes) {
    await data_db.update(id, changes);
  }

  async function deleteModelComponents(modelId) {
    await model_components_db.where("id").equals(modelId).delete();
    await database.model_components_relation.where("id").equals(modelId).delete();
  }



  async function getAllModelComponentsViewerIds(modelId) {
    const components = await model_components_db.where("id").equals(modelId).toArray();
    return components.map((component) => Number.parseInt(component.viewer_id, 10));
  }

  async function getMeshComponentsViewerIds(modelId, meshComponentGeodeIds) {
    const components = await model_components_db
      .where("[id+geode_id]")
      .anyOf(meshComponentGeodeIds.map((geode_id) => [modelId, geode_id]))
      .toArray();
    return components.map((component) => Number.parseInt(component.viewer_id, 10));
  }

  async function exportStores() {
    const items = await data_db.toArray();
    return { items };
  }

  async function importStores(_snapshot) {
    await clear();
  }

  async function clear() {
    await data_db.clear();
  }

  return {
    refAllItems,
    item,
    allItems,
    refItem,
    meshComponentType,
    registerObject,
    deregisterObject,
    addItem,
    addComponents,
    addComponentRelations,
    deleteItem,
    updateItem,
    getAllModelComponentsViewerIds,
    getMeshComponentsViewerIds,
    getComponentByViewerId,

    exportStores,
    importStores,
    clear,

    formatedMeshComponents,
    refFormatedMeshComponents,
    getMeshComponentsByType,
    getAllMeshComponents,
    fetchAllMeshComponents,
    getMeshComponentGeodeIds,
    getCornersGeodeIds,
    getLinesGeodeIds,
    getSurfacesGeodeIds,
    getBlocksGeodeIds,

    hasCollectionComponents,
    getAllCollectionComponents,
    fetchAllCollectionComponents,
    formatedCollectionComponents,
    refFormatedCollectionComponents,
  };
});
