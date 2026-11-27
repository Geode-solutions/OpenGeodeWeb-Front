// Local imports
import { type DataItem, useDataStore } from "@ogw_front/stores/data";

// Replaces the data store's live items: the testing pinia makes its getters writable,
// And every reader (crs, basemap, components) follows as it would a database change
function setDataItems(items: readonly Partial<DataItem>[]): void {
  const dataStore: { items: unknown } = useDataStore();
  dataStore.items = items;
}

export { setDataItems };
