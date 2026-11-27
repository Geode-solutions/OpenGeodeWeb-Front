import {
  type DataSnapshot,
  clearTables,
  deleteItem,
  exportStores,
  importTables,
} from "@ogw_internal/stores/data/snapshot";
import {
  addComponentRelations,
  addComponents,
  getAllModelComponentsViewerIds,
  getComponentByViewerId,
  getComponentsByViewerIds,
  getMeshComponentsViewerIds,
  meshComponentType,
} from "@ogw_internal/stores/data/model/components";
import {
  addItem,
  allItems,
  fetchIsViewable,
  item,
  refItem,
  updateItem,
  useDataItems,
} from "@ogw_internal/stores/data/items";
import {
  addPhysicalProperties,
  getPhysicalProperties,
  refPhysicalProperties,
} from "@ogw_internal/stores/data/model/physical_properties";
import {
  fetchAllCollectionComponents,
  formatedCollectionComponents,
  getAllCollectionComponents,
  hasCollectionComponents,
  refFormatedCollectionComponents,
} from "@ogw_internal/stores/data/model/collections";
import {
  fetchAllComponentRelations,
  getComponentRelations,
} from "@ogw_internal/stores/data/model/relations";
import {
  fetchAllMeshComponents,
  formatedMeshComponents,
  getAllMeshComponents,
  getBlocksGeodeIds,
  getCornersGeodeIds,
  getLinesGeodeIds,
  getMeshComponentGeodeIds,
  getMeshComponentsByType,
  getSurfacesGeodeIds,
  refFormatedMeshComponents,
} from "@ogw_internal/stores/data/model/mesh_components";
import { useDataRegistration } from "@ogw_internal/stores/data/registration";

// oxlint-disable-next-line max-lines-per-function
export const useDataStore = defineStore("data", () => {
  const { items, isViewable } = useDataItems();
  const { registeredItems, isRegistered, registerObject, deregisterObject, clearRegistrations } =
    useDataRegistration(items);

  async function clear(): Promise<void> {
    clearRegistrations();
    await clearTables();
  }

  async function importStores(snapshot: DataSnapshot): Promise<void> {
    clearRegistrations();
    await importTables(snapshot);
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
    addPhysicalProperties,
    getPhysicalProperties,
    refPhysicalProperties,
  };
});

export type { CrsItem, NewDataItem } from "@ogw_internal/stores/data/types";
export type { ModelComponentInput } from "@ogw_internal/stores/data/model/types";
export type { DataItem } from "@ogw_internal/database/tables/data";
