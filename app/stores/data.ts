// oxlint-disable eslint/max-lines
// Third party imports
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { Table } from "dexie";
import { useObservable } from "@vueuse/rxjs";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import type { DataId, GeodeId } from "@geode/opengeodeweb-microservice/schema_types";
import type {
  DataIdentified,
  GeodeIdentified,
  GeodeObjectTyped,
  ModelId,
  ViewerObjectTyped,
} from "@ogw_front/types/identifiers";
import { type LegacyDataId, fromLegacyDataId } from "@ogw_front/utils/legacy_data_id";
import { type ModelComponentRecord, useDataMesh } from "./data_helpers/mesh.js";
import { type ModelComponentRelationRecord, useDataRelations } from "./data_helpers/relations.js";
import { database, writeTransaction } from "@ogw_internal/database/database.js";
import { liveObservable } from "@ogw_front/utils/live_observable";
import { useDataCollections } from "./data_helpers/collections.js";
import { useViewerStore } from "@ogw_front/stores/viewer";

interface DataItem extends DataIdentified, GeodeIdentified, GeodeObjectTyped, ViewerObjectTyped {
  name: string;
  visible: boolean;
  created_at: string;
  is_viewable?: boolean;
  binary_light_viewable?: string;
  crs?: CRS;
}

// What the CRS features read of a data: light to copy on each change
type CrsItem = Pick<DataItem, "data_id" | "name" | "crs" | "created_at">;

interface ModelComponentInput extends GeodeIdentified {
  type: string;
  viewer_id: string | number;
  name: string;
  is_active: boolean;
  boundaries?: string[];
  internals?: string[];
  items?: string[];
}

interface NewDataItem extends DataIdentified, GeodeIdentified, GeodeObjectTyped, ViewerObjectTyped {
  name?: string;
  is_viewable?: boolean;
  binary_light_viewable?: string;
  crs?: CRS;
  // Set on saved data: kept by the project snapshot
  created_at?: string;
  mesh_components?: ModelComponentInput[];
  collection_components?: ModelComponentInput[];
  nb_vertices?: number;
}

const viewer_generic_schemas = viewer_schemas.opengeodeweb_viewer.generic;
// The database's table map is dynamically assembled at runtime (see internal/database/database.ts), so its exported type is a loose `{}`; cast it to the shape it actually has at runtime rather than widening every call site.
type DatabaseTables = Record<string, unknown>;
// oxlint-disable-next-line no-unsafe-type-assertion -- see comment above.
const typedDatabase = database as unknown as DatabaseTables;
// A missing data is not viewable. Data imported before `is_viewable` existed fall back on their viewable file
function isDataItemViewable(data_item: DataItem | undefined): boolean {
  if (data_item === undefined) {
    return false;
  }
  if (data_item.is_viewable !== undefined) {
    return data_item.is_viewable;
  }
  if (data_item.binary_light_viewable !== undefined) {
    return data_item.binary_light_viewable !== "not_viewable";
  }
  return data_item.geode_object_type !== "HorizonStack3D";
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
  const { getComponentRelations, fetchAllComponentRelations } = useDataRelations();
  // Ids the viewer holds a pipeline for: an item is stored before it is registered, and non viewable items never are
  const registeredIds = reactive(new Set<string>());
  async function item(dataId: DataId): Promise<DataItem> {
    const data_item = await data_db.get(dataId);
    if (!data_item) {
      throw new Error(`Item not found: ${dataId}`);
    }
    return data_item;
  }
  async function allItems(): Promise<DataItem[]> {
    const items = await data_db.toArray();
    return items;
  }
  function refItem(dataId: DataId): Ref<DataItem | undefined> {
    return useObservable(
      liveObservable(async () => {
        const data_item = await data_db.get(dataId);
        return data_item;
      }),
      {
        // oxlint-disable-next-line no-unsafe-type-assertion -- placeholder until the live query resolves; consumers must treat this as possibly incomplete.
        initialValue: {} as DataItem,
      },
    );
  }
  // A single live query of the data table, shared by every reader
  const liveItems = useObservable(
    liveObservable(async () => {
      const all_items = await data_db.toArray();
      return all_items;
    }),
    { initialValue: [] as DataItem[] },
  );
  const items = computed(() => liveItems.value);
  function isRegistered(dataId: DataId): boolean {
    return registeredIds.has(dataId);
  }
  const registeredItems = computed(() =>
    items.value.filter((data_item) => isRegistered(data_item.data_id)),
  );
  const itemsById = computed(
    () => new Map(items.value.map((data_item) => [data_item.data_id, data_item])),
  );
  // From the live items: reactive, for the data already shown
  function isViewable(dataId: DataId): boolean {
    return isDataItemViewable(itemsById.value.get(dataId));
  }
  // From the database: for code right after a write, which the live items may not show yet
  async function fetchIsViewable(dataId: DataId): Promise<boolean> {
    const data_item = await data_db.get(dataId);
    return isDataItemViewable(data_item);
  }
  async function meshComponentType(
    modelId: ModelId,
    geode_id: GeodeId,
  ): Promise<string | undefined> {
    const component = await model_components_db
      .where("[data_id+geode_id]")
      .equals([modelId, geode_id])
      .first();
    return component?.type;
  }
  async function registerObject(dataId: DataId, name: string): Promise<unknown> {
    const schema = viewer_generic_schemas.register;
    const params = {
      id: dataId,
      name,
    };
    const result = await viewerStore.request({
      schema,
      params,
      timeout: 0,
    });
    registeredIds.add(dataId);
    return result;
  }
  async function deregisterObject(dataId: DataId): Promise<unknown> {
    const schema = viewer_generic_schemas.deregister;
    const params = {
      id: dataId,
    };
    registeredIds.delete(dataId);
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
      data_id: new_item.data_id,
      geode_id: new_item.geode_id,
      name: new_item.name ?? new_item.data_id,
      viewer_object_type: new_item.viewer_object_type,
      geode_object_type: new_item.geode_object_type,
      visible: true,
      created_at: new Date().toISOString(),
      is_viewable: new_item.is_viewable,
    };
    if (new_item.binary_light_viewable !== undefined && new_item.binary_light_viewable !== null) {
      itemData.binary_light_viewable = new_item.binary_light_viewable;
    }
    if (new_item.crs !== undefined) {
      itemData.crs = new_item.crs;
    }
    const dataId = await data_db.put(itemData);
    return dataId;
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
          data_id: new_item.data_id,
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
          data_id: new_item.data_id,
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
    modelId: ModelId,
    viewer_id: string | number,
  ): Promise<ModelComponentRecord | undefined> {
    const component = await model_components_db
      .where("viewer_id")
      .equals(Number(viewer_id))
      .and((model_component: ModelComponentRecord) => model_component.data_id === modelId)
      .first();
    return component;
  }
  async function getComponentsByViewerIds(
    modelId: ModelId,
    viewer_ids: number[],
  ): Promise<ModelComponentRecord[]> {
    const components = await model_components_db
      .where("viewer_id")
      .anyOf(viewer_ids)
      .and((model_component: ModelComponentRecord) => model_component.data_id === modelId)
      .toArray();
    return components;
  }
  async function deleteModelComponents(modelId: ModelId): Promise<void> {
    await writeTransaction([model_components_db, model_components_relation_db], async () => {
      await model_components_db.where("data_id").equals(modelId).delete();
      await model_components_relation_db.where("data_id").equals(modelId).delete();
    });
  }

  // A data is deleted with its components and their relations, or not at all
  async function deleteItem(dataId: DataId): Promise<void> {
    await writeTransaction(
      [data_db, model_components_db, model_components_relation_db],
      async () => {
        await data_db.delete(dataId);
        await deleteModelComponents(dataId);
      },
    );
  }

  async function updateItem(dataId: DataId, changes: Partial<DataItem>): Promise<void> {
    await data_db.update(dataId, changes);
  }

  async function getAllModelComponentsViewerIds(modelId: ModelId): Promise<number[]> {
    const components = await model_components_db.where("data_id").equals(modelId).toArray();
    return components.map((component: ModelComponentRecord) =>
      Math.trunc(Number(component.viewer_id)),
    );
  }
  async function getMeshComponentsViewerIds(
    modelId: ModelId,
    meshComponentGeodeIds: readonly string[],
  ): Promise<number[]> {
    const components = await model_components_db
      .where("[data_id+geode_id]")
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
    return {
      items: await data_db.toArray(),
      modelComponents: await model_components_db.toArray(),
      modelComponentsRelations: await model_components_relation_db.toArray(),
    };
  }

  async function clear(): Promise<void> {
    registeredIds.clear();
    await writeTransaction(
      [data_db, model_components_db, model_components_relation_db],
      async () => {
        await data_db.clear();
        await model_components_db.clear();
        await model_components_relation_db.clear();
      },
    );
  }

  // Dexie's bulkPut expects mutable arrays, so this snapshot parameter can't deeply satisfy
  // The prefer-readonly-parameter-types rule; same pattern as app/utils/import_workflow.ts.
  async function importStores(snapshot: {
    readonly modelComponents: readonly (
      | LegacyDataId<ModelComponentRecord>
      | ModelComponentRecord
    )[];
    readonly modelComponentsRelations: readonly (
      | LegacyDataId<ModelComponentRelationRecord>
      | ModelComponentRelationRecord
    )[];
  }): Promise<void> {
    // The snapshot replaces the stored data as a whole: a failed import leaves the previous one
    await writeTransaction(
      [data_db, model_components_db, model_components_relation_db],
      async () => {
        await clear();
        await model_components_db.bulkPut(
          snapshot.modelComponents.map((component) =>
            fromLegacyDataId<ModelComponentRecord>(component),
          ),
        );
        await model_components_relation_db.bulkPut(
          snapshot.modelComponentsRelations.map((relation) =>
            fromLegacyDataId<ModelComponentRelationRecord>(relation),
          ),
        );
      },
    );
  }
  return {
    items,
    registeredItems,
    isRegistered,
    item,
    allItems,
    refItem,
    isViewable,
    fetchIsViewable,
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
    getComponentsByViewerIds,
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
    getComponentRelations,
    fetchAllComponentRelations,
  };
});

export type { CrsItem, DataItem, NewDataItem, ModelComponentInput };
