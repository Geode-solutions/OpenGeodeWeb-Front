import type { StoreId } from "@ogw_front/types/identifiers";
import { consola } from "consola";

interface RegisterableStore {
  $id: StoreId;
  $patch?: (partial: Record<string, unknown>) => void;
  exportStores?: (params?: Record<string, unknown>) => Promise<unknown>;
  importStores?: (snapshot: unknown) => Promise<void> | void;
  connect?: () => Promise<void>;
  kill?: () => Promise<void>;
  [key: string]: unknown;
}

async function exportRegisteredStores(
  stores: readonly RegisterableStore[],
  params: Record<string, unknown> = {},
): Promise<Record<StoreId, unknown>> {
  const snapshot: Record<StoreId, unknown> = {};

  await Promise.all(
    stores.map(async (store: RegisterableStore) => {
      if (!store.exportStores) {
        return;
      }
      const storeId = store.$id;
      try {
        snapshot[storeId] = await store.exportStores(params);
      } catch {
        // Ignore stores that fail to export; other stores still complete independently.
      }
    }),
  );
  return snapshot;
}

async function importRegisteredStores(
  stores: readonly RegisterableStore[],
  snapshot: Record<StoreId, unknown> | undefined,
): Promise<void> {
  if (!snapshot) {
    return;
  }

  const missingStoreIds: StoreId[] = [];

  await Promise.all(
    stores.map(async (store: RegisterableStore) => {
      if (!store.importStores) {
        return;
      }
      const storeId = store.$id;
      if (snapshot[storeId] === undefined) {
        missingStoreIds.push(storeId);
        return;
      }
      try {
        await store.importStores(snapshot[storeId]);
      } catch {
        // Ignore stores that fail to import; other stores still complete independently.
      }
    }),
  );

  if (missingStoreIds.length > 0) {
    consola.warn(`Stores not found in snapshot: ${missingStoreIds.join(", ")}`);
  }
}

export { exportRegisteredStores, importRegisteredStores };
export type { RegisterableStore };
