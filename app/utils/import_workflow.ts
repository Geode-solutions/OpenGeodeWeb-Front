// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { consola } from "consola";

// Local imports
import { type NewDataItem, useDataStore } from "@ogw_front/stores/data";
import type { CRS } from "@geode/opengeodeweb-back/schema_types";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import type { GeodeObjectTyped } from "@ogw_front/types/identifiers";
import type { LegacyDataId } from "@ogw_front/utils/legacy_data_id";
import { importItem } from "@ogw_front/utils/import_item";
import { reloadObject } from "@ogw_front/utils/reload_object";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useProjectCrs } from "@ogw_front/composables/project_crs";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

interface FileToImport extends Readonly<GeodeObjectTyped> {
  readonly filename: string;
}

// A single file can hold several objects: every one of them is imported, ids are returned in the response order
async function importFile(filename: string, geode_object_type: GeodeObjectType): Promise<DataId[]> {
  const backStore = useBackStore();
  const schema = back_schemas.opengeodeweb_back.save_viewable_file;
  const params = { geode_object_type, filename };
  // The conversion can be long: the file shows in the tree meanwhile, then is replaced by its objects
  const response = await useTreeviewStore().whilePendingImport(
    geode_object_type,
    filename,
    backStore.request({ schema, params }),
  );
  // oxlint-disable-next-line no-unsafe-type-assertion -- this is the trusted API boundary; each back-end response item matches NewDataItem, except for its legacy id.
  const items = response.data as LegacyDataId<NewDataItem>[];
  const dataIds = await Promise.all(
    items.map(async (item) => {
      const dataId = await importItem(item);
      return dataId;
    }),
  );
  return dataIds;
}

async function importFiles(files: readonly FileToImport[]): Promise<DataId[]> {
  const hybridViewerStore = useHybridViewerStore();
  // Files are imported concurrently and the viewer only frames the first actor to arrive, so the camera is reset once everything is loaded
  const wasSceneEmpty = Object.keys(hybridViewerStore.hybridDb).length === 0;
  const chunk_size = 5;
  const chunks: FileToImport[][] = [];
  for (let i = 0; i < files.length; i += chunk_size) {
    chunks.push(files.slice(i, i + chunk_size));
  }

  const results: DataId[] = [];
  const errors: unknown[] = [];
  async function processChunk(chunkIndex: number): Promise<void> {
    if (chunkIndex >= chunks.length) {
      return;
    }
    const chunk = chunks[chunkIndex] ?? [];
    // A failing file does not prevent the other files from being imported
    const chunk_results = await Promise.allSettled(
      chunk.map(async ({ filename, geode_object_type }) => {
        const dataIds = await importFile(filename, geode_object_type);
        return dataIds;
      }),
    );
    for (const result of chunk_results) {
      if (result.status === "fulfilled") {
        results.push(...result.value);
      } else {
        errors.push(result.reason);
      }
    }
    await processChunk(chunkIndex + 1);
  }
  await processChunk(0);
  const isSceneFilled = Object.keys(hybridViewerStore.hybridDb).length > 0;
  if (wasSceneEmpty && isSceneFilled) {
    hybridViewerStore.resetCamera();
  }
  await hybridViewerStore.remoteRender();
  if (errors.length > 0) {
    throw new AggregateError(errors, `${errors.length} file(s) could not be imported`);
  }
  return results;
}

// A harmonization failure is only logged: the import outcome does not depend on it
async function harmonize(ids: DataId[], projectCrs: CRS | undefined): Promise<void> {
  try {
    await useProjectCrs().harmonizeImportedCrs(ids, projectCrs);
  } catch (error) {
    consola.error("CRS harmonization failed:", error);
  }
}

// When a file fails, the workflow throws without returning the imported ids: they are found by difference.
// The project CRS is read before the import, as the project follows the data as they land.
async function importWorkflow(files: readonly FileToImport[]): Promise<DataId[]> {
  const { projectCrs } = useCrsStore();
  const existingItems = await useDataStore().allItems();
  const existingIds = new Set(existingItems.map((item) => item.data_id));
  try {
    const ids = await importFiles(files);
    return ids;
  } finally {
    const items = await useDataStore().allItems();
    const importedIds = items.map((item) => item.data_id).filter((id) => !existingIds.has(id));
    // Conversions can be long: the caller is not kept waiting, the snackbars report the outcome
    void harmonize(importedIds, projectCrs);
  }
}

// NewDataItem has mutable array fields (mesh_components, collection_components), so a readonly array of it can't satisfy prefer-readonly-parameter-types deeply; left unfixed (same pattern as app/plugins/auto_store_register.ts).
async function importWorkflowFromSnapshot(
  items: readonly (LegacyDataId<NewDataItem> | NewDataItem)[],
): Promise<DataId[]> {
  consola.debug("[importWorkflowFromSnapshot] start", { count: items?.length });
  const hybridViewerStore = useHybridViewerStore();
  const chunk_size = 5;
  const chunks: (LegacyDataId<NewDataItem> | NewDataItem)[][] = [];
  for (let i = 0; i < items.length; i += chunk_size) {
    chunks.push(items.slice(i, i + chunk_size));
  }
  const ids: DataId[] = [];
  async function processChunk(chunkIndex: number): Promise<void> {
    if (chunkIndex >= chunks.length) {
      return;
    }
    const chunk = chunks[chunkIndex] ?? [];
    const chunk_ids = await Promise.all(
      chunk.map(async (item) => {
        const dataId = await importItem(item);
        return dataId;
      }),
    );
    ids.push(...chunk_ids);
    await processChunk(chunkIndex + 1);
  }
  await processChunk(0);
  await hybridViewerStore.remoteRender();
  consola.debug("[importWorkflowFromSnapshot] done", {
    ids,
  });
  return ids;
}

// The time series only adds attributes to the model, so the viewer object is reloaded.
async function applyTimeSeriesWorkflow(filename: string, dataId: DataId): Promise<DataId> {
  const backStore = useBackStore();
  await backStore.request({
    schema: back_schemas.opengeodeweb_back.apply_time_series,
    params: { id: dataId, filename },
  });
  await reloadObject(dataId);
  return dataId;
}

export { importFile, importWorkflow, importWorkflowFromSnapshot, applyTimeSeriesWorkflow };
export { importItem } from "@ogw_front/utils/import_item";
export { reloadObject } from "@ogw_front/utils/reload_object";
