import { type LegacyDataId, fromLegacyDataId } from "@ogw_front/utils/legacy_data_id";
import {
  dataDb,
  modelComponentsDb,
  modelComponentsRelationDb,
  modelPhysicalPropertiesDb,
  writeTransaction,
} from "@ogw_internal/database/database.js";
import {
  modelComponentRelationsOf,
  modelComponentsOf,
  modelPhysicalPropertiesOf,
} from "@ogw_internal/database/queries.js";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { DataItem } from "@ogw_internal/database/tables/data";
import type { ModelComponentRecord } from "@ogw_internal/database/tables/model_components";
import type { ModelComponentRelationRecord } from "@ogw_internal/database/tables/model_components_relation";
import type { ModelId } from "@ogw_front/types/identifiers";

const dataTable = dataDb();
const modelComponentsTable = modelComponentsDb();
const modelComponentsRelationTable = modelComponentsRelationDb();
// Not in the snapshot: a restored project reads them again from the back
const modelPhysicalPropertiesTable = modelPhysicalPropertiesDb();
const modelTables = [
  modelComponentsTable,
  modelComponentsRelationTable,
  modelPhysicalPropertiesTable,
];
const dataTables = [dataTable, ...modelTables];

interface DataSnapshot {
  readonly modelComponents: readonly (LegacyDataId<ModelComponentRecord> | ModelComponentRecord)[];
  readonly modelComponentsRelations: readonly (
    | LegacyDataId<ModelComponentRelationRecord>
    | ModelComponentRelationRecord
  )[];
}

async function deleteModelComponents(modelId: ModelId): Promise<void> {
  await writeTransaction(modelTables, async () => {
    await modelComponentsOf(modelId).delete();
    await modelComponentRelationsOf(modelId).delete();
    await modelPhysicalPropertiesOf(modelId).delete();
  });
}

// A data is deleted with its components and their relations, or not at all
async function deleteItem(dataId: DataId): Promise<void> {
  await writeTransaction(dataTables, async () => {
    await dataTable.delete(dataId);
    await deleteModelComponents(dataId);
  });
}

async function exportStores(): Promise<{
  items: DataItem[];
  modelComponents: ModelComponentRecord[];
  modelComponentsRelations: ModelComponentRelationRecord[];
}> {
  return {
    items: await dataTable.toArray(),
    modelComponents: await modelComponentsTable.toArray(),
    modelComponentsRelations: await modelComponentsRelationTable.toArray(),
  };
}

async function clearTables(): Promise<void> {
  await writeTransaction(dataTables, async () => {
    await dataTable.clear();
    await modelComponentsTable.clear();
    await modelComponentsRelationTable.clear();
    await modelPhysicalPropertiesTable.clear();
  });
}

// The snapshot replaces the stored data as a whole: a failed import leaves the previous one.
// Dexie's bulkPut expects mutable arrays, so this snapshot parameter can't deeply satisfy
// The prefer-readonly-parameter-types rule; same pattern as app/utils/import_workflow.ts.
async function importTables(snapshot: DataSnapshot): Promise<void> {
  await writeTransaction(dataTables, async () => {
    await clearTables();
    await modelComponentsTable.bulkPut(
      snapshot.modelComponents.map((component) =>
        fromLegacyDataId<ModelComponentRecord>(component),
      ),
    );
    await modelComponentsRelationTable.bulkPut(
      snapshot.modelComponentsRelations.map((relation) =>
        fromLegacyDataId<ModelComponentRelationRecord>(relation),
      ),
    );
  });
}

export { clearTables, deleteItem, exportStores, importTables };
export type { DataSnapshot };
