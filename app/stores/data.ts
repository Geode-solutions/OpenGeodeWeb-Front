// Third party imports
import type { Table } from "dexie";
import { liveQuery } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { database } from "@ogw_internal/database/database.js";
import { useDataCollections } from "./data_helpers/collections.js";
import { useDataMesh } from "./data_helpers/mesh.js";
import { useViewerStore } from "@ogw_front/stores/viewer";
import type { ModelComponentRecord } from "./data_helpers/mesh.js";
import type { Observable } from "rxjs";

interface DataItem {
  id: string;
  name: string;
  viewer_type: string;
  geode_object_type: string;
  visible: boolean;
  created_at: string;
  is_viewable?: boolean;
  binary_light_viewable?: string;
}

interface ModelComponentInput {
  geode_id: string;
  type: string;
  viewer_id: string | number;
  name: string;
  is_active: boolean;
  boundaries?: string[];
  internals?: string[];
  items?: string[];
}

interface NewDataItem {
  id: string;
  name?: string;
  viewer_type: string;
  geode_object_type: string;
  is_viewable?: boolean;
  binary_light_viewable?: string;
  mesh_components?: ModelComponentInput[];
  collection_components?: ModelComponentInput[];
  nb_vertices?: number;
}

interface ModelComponentRelationRecord {
  id: string;
  parent: string;
  child: string;
  type: string;
}

interface ViewableItemLike {
  is_viewable?: boolean;
  binary_light_viewable?: string;
  geode_object_type?: string;
  id?: string;
  title?: string;
}

const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic;
function checkItemViewable(item: ViewableItemLike | undefined | null): boolean {
  if (!item || typeof item !== "object") {
    return false;
  }
  if (item.is_viewable !== undefined) {
    return Boolean(item.is_viewable);
  }
  if (item.binary_light_viewable !== undefined) {
    return item.binary_light_viewable !== "not_viewable";
  }
  if (
    item.geode_object_type === "HorizonStack3D" ||
    item.id === "HorizonStack3D" ||
    item.title === "HorizonStack3D"
  ) {
    return false;
  }
  return true;
}
function isItemViewable(itemOrId: string | ViewableItemLike): boolean | Promise<boolean> {
  if (typeof itemOrId === "string") {
    return (database.data as unknown as Table<DataItem, string>)
      .get(itemOrId)
      .then(checkItemViewable);
  }
  return checkItemViewable(itemOrId);
}

// oxlint-disable-next-line max-lines-per-function, max-statements
export const useDataStore = defineStore("data", () => {
  const viewerStore = useViewerStore();
  const data_db = database.data as unknown as Table<DataItem, string>;
  const model_components_db = database.model_components as unknown as Table<
    ModelComponentRecord,
    string
  >;
  const model_components_relation_db = database.model_components_relation as unknown as Table<
    ModelComponentRelationRecord,
    string
  >;
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
  async function item(id: string): Promise<DataItem> {
    const data_item = await data_db.get(id);
    if (!data_item) {
      throw new Error(`Item not found: ${id}`);
    }
    return data_item;
  }
  async function allItems(): Promise<DataItem[]> {
    return await data_db.toArray();
  }
  function refItem(id: string) {
    // Dexie's liveQuery() returns Dexie's own minimal Observable shape, not an
    // Actual rxjs Observable instance (useObservable's declared parameter type);
    // The two are structurally close enough at runtime (vueuse only calls
    // `.subscribe`) but not identical, hence the cast.
    return useObservable(
      liveQuery(() => data_db.get(id)) as unknown as Observable<DataItem | undefined>,
      {
        initialValue: {} as DataItem,
      },
    );
  }
  function refAllItems() {
    return useObservable(
      liveQuery(() => data_db.toArray()) as unknown as Observable<DataItem[]>,
      {
        initialValue: [] as DataItem[],
      },
    );
  }
  async function meshComponentType(modelId: string, geode_id: string): Promise<string | undefined> {
    const component = await model_components_db
      .where("[id+geode_id]")
      .equals([modelId, geode_id])
      .first();
    return component?.type;
  }
  async function registerObject(id: string, name: string) {
    const schema = viewer_generic_schemas.register;
    const params = {
      id,
      name,
    };
    return await viewerStore.request({
      schema,
      params,
      timeout: 0,
    });
  }
  async function deregisterObject(id: string) {
    const schema = viewer_generic_schemas.deregister;
    const params = {
      id,
    };
    return await viewerStore.request({
      schema,
      params,
    });
  }
  function addItem(new_item: NewDataItem) {
    const itemData: DataItem = {
      id: new_item.id,
      name: new_item.name || new_item.id,
      viewer_type: new_item.viewer_type,
      geode_object_type: new_item.geode_object_type,
      visible: true,
      created_at: new Date().toISOString(),
      is_viewable: new_item.is_viewable,
    };
    if (new_item.binary_light_viewable !== undefined && new_item.binary_light_viewable !== null) {
      itemData.binary_light_viewable = new_item.binary_light_viewable;
    }
    return data_db.put(itemData);
  }
  function addComponents(new_item: NewDataItem) {
    const allComponents: ModelComponentRecord[] = [];
    function addModelComponents(components: ModelComponentInput[]) {
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
  function addComponentRelations(new_item: NewDataItem) {
    const relations: ModelComponentRelationRecord[] = [];
    function addModelComponentRelations(components: string[], parent: string, type: string) {
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
  async function getComponentByViewerId(modelId: string, viewer_id: string | number) {
    const component = await model_components_db
      .where("viewer_id")
      .equals(Number(viewer_id))
      .and((model_component) => model_component.id === modelId)
      .first();
    return component;
  }
  async function deleteModelComponents(modelId: string): Promise<void> {
    await model_components_db.where("id").equals(modelId).delete();
    await model_components_relation_db.where("id").equals(modelId).delete();
  }

  async function deleteItem(id: string): Promise<void> {
    await data_db.delete(id);
    await deleteModelComponents(id);
  }

  async function updateItem(id: string, changes: Partial<DataItem>): Promise<void> {
    await data_db.update(id, changes);
  }

  async function getAllModelComponentsViewerIds(modelId: string): Promise<number[]> {
    const components = await model_components_db.where("id").equals(modelId).toArray();
    return components.map((component) => Math.trunc(Number(component.viewer_id)));
  }
  async function getMeshComponentsViewerIds(
    modelId: string,
    meshComponentGeodeIds: string[],
  ): Promise<number[]> {
    const components = await model_components_db
      .where("[id+geode_id]")
      .anyOf(meshComponentGeodeIds.map((geode_id) => [modelId, geode_id]))
      .toArray();
    return components.map((component) => Math.trunc(Number(component.viewer_id)));
  }
  async function exportStores() {
    const items = await data_db.toArray();
    const modelComponents = await model_components_db.toArray();
    const modelComponentsRelations = await model_components_relation_db.toArray();
    return {
      items,
      modelComponents,
      modelComponentsRelations,
    };
  }

  async function clear(): Promise<void> {
    await data_db.clear();
    await model_components_db.clear();
    await model_components_relation_db.clear();
  }

  async function importStores(snapshot: {
    modelComponents: ModelComponentRecord[];
    modelComponentsRelations: ModelComponentRelationRecord[];
  }): Promise<void> {
    await clear();
    await model_components_db.bulkPut(snapshot.modelComponents);
    await model_components_relation_db.bulkPut(snapshot.modelComponentsRelations);
  }
  return {
    refAllItems,
    item,
    allItems,
    refItem,
    isItemViewable,
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

export type { DataItem, NewDataItem, ModelComponentInput, ModelComponentRelationRecord };
