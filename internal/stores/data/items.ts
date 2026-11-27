import type { ComputedRef, Ref } from "vue";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { DataItem } from "@ogw_internal/database/tables/data";
import type { NewDataItem } from "./types";
import { dataDb } from "@ogw_internal/database/database.js";
import { liveObservable } from "@ogw_front/utils/live_observable";
import { useObservable } from "@vueuse/rxjs";

const dataTable = dataDb();

// A missing data is not viewable. Data imported before `is_viewable` existed fall back on their viewable file
function isDataItemViewable(dataItem: DataItem | undefined): boolean {
  if (dataItem === undefined) {
    return false;
  }
  if (dataItem.is_viewable !== undefined) {
    return dataItem.is_viewable;
  }
  if (dataItem.binary_light_viewable !== undefined) {
    return dataItem.binary_light_viewable !== "not_viewable";
  }
  return dataItem.geode_object_type !== "HorizonStack3D";
}

async function item(dataId: DataId): Promise<DataItem> {
  const dataItem = await dataTable.get(dataId);
  if (!dataItem) {
    throw new Error(`Item not found: ${dataId}`);
  }
  return dataItem;
}

async function allItems(): Promise<DataItem[]> {
  const storedItems = await dataTable.toArray();
  return storedItems;
}

function refItem(dataId: DataId): Ref<DataItem | undefined> {
  return useObservable(
    liveObservable(async () => {
      const dataItem = await dataTable.get(dataId);
      return dataItem;
    }),
    {
      // oxlint-disable-next-line no-unsafe-type-assertion -- placeholder until the live query resolves; consumers must treat this as possibly incomplete.
      initialValue: {} as DataItem,
    },
  );
}

// From the database: for code right after a write, which the live items may not show yet
async function fetchIsViewable(dataId: DataId): Promise<boolean> {
  const dataItem = await dataTable.get(dataId);
  return isDataItemViewable(dataItem);
}

// NewDataItem has mutable array fields (mesh_components, collection_components), so it can't
// Satisfy prefer-readonly-parameter-types deeply; same pattern as app/utils/import_workflow.ts.
async function addItem(newItem: NewDataItem): Promise<DataId> {
  const itemData: DataItem = {
    data_id: newItem.data_id,
    geode_id: newItem.geode_id,
    name: newItem.name ?? newItem.data_id,
    viewer_object_type: newItem.viewer_object_type,
    geode_object_type: newItem.geode_object_type,
    visible: true,
    created_at: new Date().toISOString(),
    is_viewable: newItem.is_viewable,
  };
  if (newItem.binary_light_viewable !== undefined && newItem.binary_light_viewable !== null) {
    itemData.binary_light_viewable = newItem.binary_light_viewable;
  }
  if (newItem.crs !== undefined) {
    itemData.crs = newItem.crs;
  }
  const dataId = await dataTable.put(itemData);
  return dataId;
}

async function updateItem(dataId: DataId, changes: Partial<DataItem>): Promise<void> {
  await dataTable.update(dataId, changes);
}

// A single live query of the data table, shared by every reader
function useDataItems(): {
  items: ComputedRef<DataItem[]>;
  itemsById: ComputedRef<Map<DataId, DataItem>>;
  isViewable: (dataId: DataId) => boolean;
} {
  const liveItems = useObservable(
    liveObservable(async () => {
      const storedItems = await dataTable.toArray();
      return storedItems;
    }),
    { initialValue: [] as DataItem[] },
  );
  const items = computed(() => liveItems.value);
  const itemsById = computed(
    () => new Map(items.value.map((dataItem) => [dataItem.data_id, dataItem])),
  );

  // From the live items: reactive, for the data already shown
  function isViewable(dataId: DataId): boolean {
    return isDataItemViewable(itemsById.value.get(dataId));
  }

  return { items, itemsById, isViewable };
}

export { addItem, allItems, fetchIsViewable, item, refItem, updateItem, useDataItems };
