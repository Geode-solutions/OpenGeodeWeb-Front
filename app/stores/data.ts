// oxlint-disable eslint/max-lines
// Third party imports
import { type Table, liveQuery } from "dexie";
import type { Observable } from "rxjs";
import { useObservable } from "@vueuse/rxjs";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { type ModelComponentRecord, useDataMesh } from "./data_helpers/mesh.js";
import { database } from "@ogw_internal/database/database.js";
import { useDataCollections } from "./data_helpers/collections.js";
import { useViewerStore } from "@ogw_front/stores/viewer";

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
// The database's table map is dynamically assembled at runtime (see internal/database/database.ts), so its exported type is a loose `{}`; cast it to the shape it actually has at runtime rather than widening every call site.
type DatabaseTables = Record<string, unknown>;
// oxlint-disable-next-line no-unsafe-type-assertion -- see comment above.
const typedDatabase = database as unknown as DatabaseTables;
function checkItemViewable(item: ViewableItemLike | undefined | null): boolean {
  if (!item || typeof item !== "object") {
    return false;
  }
  if (item.is_viewable !== undefined) {
    return item.is_viewable;
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
    // oxlint-disable-next-line no-unsafe-type-assertion -- database's table map is dynamically typed at runtime; see comment above.
    return (typedDatabase.data as Table<DataItem, string>).get(itemOrId).then(checkItemViewable);
  }
  return checkItemViewable(itemOrId);
}

// oxlint-disable-next-line max-lines-per-function, max-statements
export const useDataStore = defineStore("data", () => {
  const viewerStore = useViewerStore();
  // oxlint-disable-next-line no-unsafe-type-assertion -- database's table map is dynamically typed at runtime; see comment above.
  const data_db = typedDatabase.data as Table<DataItem, string>;
  // oxlint-disable-next-line no-unsafe-type-assertion -- database's table map is dynamically typed at runtime; see comment above.
  const model_components_db = typedDatabase.model_components as Table<ModelComponentRecord, string>;
  // oxlint-disable-next-line no-unsafe-type-assertion -- database's table map is dynamically typed at runtime; see comment above.
  const model_components_relation_db = typedDatabase.model_components_relation as Table<
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
    const items = await data_db.toArray();
    return items;
  }
  function refItem(id: string): Ref<DataItem | undefined> {
    // Dexie's liveQuery() returns Dexie's own minimal Observable shape, not an
    // Actual rxjs Observable instance (useObservable's declared parameter type);
    // The two are structurally close enough at runtime (vueuse only calls
    // `.subscribe`) but not identical, hence the cast.
    return useObservable(
      liveQuery(async () => {
        const data_item = await data_db.get(id);
        return data_item;
        // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vueuse/Dexie Observable boundary; see comment above.
      }) as unknown as Observable<DataItem | undefined>,
      {
        // oxlint-disable-next-line no-unsafe-type-assertion -- placeholder until the live query resolves; consumers must treat this as possibly incomplete.
        initialValue: {} as DataItem,
      },
    );
  }
  function refAllItems(): Ref<DataItem[]> {
    return useObservable(
      liveQuery(async () => {
        const items = await data_db.toArray();
        return items;
        // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vueuse/Dexie Observable boundary; see comment above.
      }) as unknown as Observable<DataItem[]>,
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
  async function registerObject(id: string, name: string): Promise<unknown> {
    const schema = viewer_generic_schemas.register;
    const params = {
      id,
      name,
    };
    const result = await viewerStore.request({
      schema,
      params,
      timeout: 0,
    });
    return result;
  }
  async function deregisterObject(id: string): Promise<unknown> {
    const schema = viewer_generic_schemas.deregister;
    const params = {
      id,
    };
    const result = await viewerStore.request({
      schema,
      params,
    });
    return result;
  }
  // NewDataItem has mutable array fields (mesh_components, collection_components), so it can't
  // Satisfy prefer-readonly-parameter-types deeply; same pattern as app/utils/import_workflow.ts.
  async function addItem(new_item: NewDataItem): Promise<string> {
    const itemData: DataItem = {
      id: new_item.id,
      name: new_item.name ?? new_item.id,
      viewer_type: new_item.viewer_type,
      geode_object_type: new_item.geode_object_type,
      visible: true,
      created_at: new Date().toISOString(),
      is_viewable: new_item.is_viewable,
    };
    if (new_item.binary_light_viewable !== undefined && new_item.binary_light_viewable !== null) {
      itemData.binary_light_viewable = new_item.binary_light_viewable;
    }
    const id = await data_db.put(itemData);
    return id;
  }
  // NewDataItem has mutable array fields (mesh_components, collection_components), so it can't
  // Satisfy prefer-readonly-parameter-types deeply; same pattern as app/utils/import_workflow.ts.
  async function addComponents(new_item: NewDataItem): Promise<string> {
    const allComponents: ModelComponentRecord[] = [];
    // ModelComponentInput has mutable array fields (boundaries, internals, items), so a readonly
    // Array of it can't satisfy prefer-readonly-parameter-types deeply; same limitation as above.
    function addModelComponents(components: readonly ModelComponentInput[]): void {
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
    const lastKey = await model_components_db.bulkPut(allComponents);
    return lastKey;
  }
  // NewDataItem has mutable array fields (mesh_components, collection_components), so it can't
  // Satisfy prefer-readonly-parameter-types deeply; same pattern as app/utils/import_workflow.ts.
  async function addComponentRelations(new_item: NewDataItem): Promise<string> {
    const relations: ModelComponentRelationRecord[] = [];
    function addModelComponentRelations(
      components: readonly string[],
      parent: string,
      type: string,
    ): void {
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
    const lastKey = await model_components_relation_db.bulkPut(relations);
    return lastKey;
  }
  async function getComponentByViewerId(
    modelId: string,
    viewer_id: string | number,
  ): Promise<ModelComponentRecord | undefined> {
    const component = await model_components_db
      .where("viewer_id")
      .equals(Number(viewer_id))
      .and((model_component: ModelComponentRecord) => model_component.id === modelId)
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
    return components.map((component: ModelComponentRecord) =>
      Math.trunc(Number(component.viewer_id)),
    );
  }
  async function getMeshComponentsViewerIds(
    modelId: string,
    meshComponentGeodeIds: readonly string[],
  ): Promise<number[]> {
    const components = await model_components_db
      .where("[id+geode_id]")
      .anyOf(meshComponentGeodeIds.map((geode_id) => [modelId, geode_id]))
      .toArray();
    return components.map((component: ModelComponentRecord) =>
      Math.trunc(Number(component.viewer_id)),
    );
  }
  async function exportStores(): Promise<{
    items: DataItem[];
    modelComponents: ModelComponentRecord[];
    modelComponentsRelations: ModelComponentRelationRecord[];
  }> {
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

  // Dexie's bulkPut expects mutable arrays, so this snapshot parameter can't deeply satisfy
  // The prefer-readonly-parameter-types rule; same pattern as app/utils/import_workflow.ts.
  async function importStores(snapshot: {
    readonly modelComponents: readonly ModelComponentRecord[];
    readonly modelComponentsRelations: readonly ModelComponentRelationRecord[];
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
