import type {
  CameraPositionId,
  CurrentSchema,
  ModelComponentStyleKey,
  ModelComponentTypeStyleKey,
  SchemaDefinition,
  TableName,
  TableSchemas,
  TreeviewConfigId,
} from "./types";
import { type CameraPositionRecord, cameraPositionsTable } from "./tables/camera_positions";
import { type DataItem, dataTable } from "./tables/data";
import { Dexie, type IndexableType, type Table } from "dexie";
import { type ModelComponentRecord, modelComponentsTable } from "./tables/model_components";
import {
  type ModelComponentRelationRecord,
  modelComponentsRelationTable,
} from "./tables/model_components_relation";
import type {
  ModelComponentStyle,
  ModelComponentTypeStyle,
  ObjectStyle,
  SceneStyle,
} from "@ogw_internal/stores/data_style/types";
import { type TreeviewConfigRecord, treeviewConfigTable } from "./tables/treeview_config";
import { BaseDatabase } from "./base_database";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import { ExtendedDatabase } from "./extended_database";
import { dataStyleTable } from "./tables/data_style";
import { modelComponentDataStyleTable } from "./tables/model_component_datastyle";
import { modelComponentTypeDataStyleTable } from "./tables/model_component_type_datastyle";
import { sceneStyleTable } from "./tables/scene_style";

interface DatabaseContainer {
  instance: Dexie | undefined;
}

const databaseContainer: DatabaseContainer = { instance: undefined };

function tableStoreDefinition(table: Table): SchemaDefinition {
  const keyPath = table.schema.primKey.src;
  const indexes = table.schema.indexes.map((index) => index.src);
  if (keyPath) {
    return [keyPath, ...indexes].join(",");
  }
  return indexes.join(",");
}

async function readCurrentSchema(): Promise<CurrentSchema> {
  const currentStores: TableSchemas = { ...BaseDatabase.initialStores };
  if (!(await Dexie.exists("Database"))) {
    return { currentVersion: 1, currentStores };
  }
  const tempDb = new Dexie("Database");
  await tempDb.open();
  const currentVersion = tempDb.verno;
  for (const table of tempDb.tables) {
    currentStores[table.name] = tableStoreDefinition(table);
  }
  tempDb.close();
  return { currentVersion, currentStores };
}

async function openExistingDatabase({
  currentVersion,
  currentStores,
}: CurrentSchema): Promise<Dexie> {
  const existingDb = new Dexie("Database");
  for (let version = 1; version <= currentVersion; version += 1) {
    if (version === 1) {
      existingDb.version(1).stores(BaseDatabase.initialStores);
    } else {
      existingDb.version(version).stores(currentStores);
    }
  }
  await existingDb.open();
  return existingDb;
}

class Database extends BaseDatabase {
  public constructor() {
    super("Database");

    this.version(3).stores(BaseDatabase.initialStores);
  }

  public static async addTable(
    tableName: TableName,
    schemaDefinition: SchemaDefinition,
  ): Promise<void> {
    await this.addTables({ [tableName]: schemaDefinition });
  }

  public static async addTables(newTables: TableSchemas): Promise<void> {
    const { currentVersion, currentStores } = await readCurrentSchema();

    const allExisting = Object.keys(newTables).every(
      (tableName) => currentStores[tableName] !== undefined,
    );

    // Set at module load time below; always defined by the time addTable/addTables runs.
    databaseContainer.instance?.close();

    if (allExisting) {
      databaseContainer.instance = await openExistingDatabase({ currentVersion, currentStores });
    } else {
      const newDb = new ExtendedDatabase(currentVersion, currentStores, newTables);
      await newDb.open();
      databaseContainer.instance = newDb;
    }
  }
}

// oxlint-disable-next-line no-top-level-await
await Dexie.delete("Database");
const initialDatabase = new Database();
databaseContainer.instance = initialDatabase;
// oxlint-disable-next-line no-top-level-await
await initialDatabase.clear();

// The set of tables is assembled dynamically at runtime (Database.addTable/addTables add stores on the fly), so fully modelling this with Dexie's row generics isn't worth it here: the proxy target is typed loosely as "any table name maps to a Dexie Table of loosely-typed rows".
type DatabaseTables = Record<string, Table<Record<string, unknown>, string>>;

// Database.addTables closes the current instance and opens a new one, so a table taken from an instance must not be kept: a store keeping it would query a closed database.
// A live table resolves the table of the current instance at each access instead.
function currentInstance(): Dexie {
  // Set at module load time below; always defined by the time the database is used.
  if (!databaseContainer.instance) {
    throw new Error("The database is not open");
  }
  return databaseContainer.instance;
}

function liveTable<TRow, TKey extends IndexableType>(tableName: TableName): Table<TRow, TKey> {
  const handler: ProxyHandler<object> = {
    get(_target, prop: string | symbol): unknown {
      const table = currentInstance().table(tableName);
      const value: unknown = Reflect.get(table, prop, table);
      if (typeof value === "function") {
        // oxlint-disable-next-line no-unsafe-return
        return value.bind(table);
      }
      return value;
    },
    // Dexie checks that the tables given to a transaction are instances of its Table.
    getPrototypeOf(): object | null {
      return Reflect.getPrototypeOf(currentInstance().table(tableName));
    },
  };
  // oxlint-disable-next-line no-unsafe-type-assertion -- the proxy forwards every access to a Dexie Table.
  return new Proxy({}, handler) as Table<TRow, TKey>;
}

function isTableName(instance: Dexie, prop: string | symbol): prop is string {
  return typeof prop === "string" && instance.tables.some((table) => table.name === prop);
}

const database = new Proxy<DatabaseTables>(
  {},
  {
    get(_target, prop: string | symbol): unknown {
      const dexie = currentInstance();
      if (isTableName(dexie, prop)) {
        return liveTable(prop);
      }
      // The instance is a Dexie subclass whose tables are only known dynamically at runtime.
      // oxlint-disable-next-line no-unsafe-type-assertion
      const instance = dexie as unknown as Record<string | symbol, unknown>;
      const value = instance[prop];
      if (typeof value === "function") {
        // oxlint-disable-next-line no-unsafe-return
        return value.bind(dexie);
      }
      return value;
    },
  },
);

// For the tables an extension registers at runtime, which the accessors below do not know.
// The caller gives the row type, and the key type when it is not a string.
function getTable<TRow, TKey extends IndexableType = string>(
  tableName: TableName,
): Table<TRow, TKey> {
  return liveTable<TRow, TKey>(tableName);
}

// One accessor per table: its row and key types are written once, here
function dataDb(): Table<DataItem, DataId> {
  return liveTable(dataTable.name);
}

function modelComponentsDb(): Table<ModelComponentRecord, string> {
  return liveTable(modelComponentsTable.name);
}

function modelComponentsRelationDb(): Table<ModelComponentRelationRecord, string> {
  return liveTable(modelComponentsRelationTable.name);
}

function dataStyleDb(): Table<ObjectStyle, DataId> {
  return liveTable(dataStyleTable.name);
}

// Keyed by [id_model, id_component]
function componentDataStyleDb(): Table<ModelComponentStyle, ModelComponentStyleKey> {
  return liveTable(modelComponentDataStyleTable.name);
}

// Keyed by [id_model, type]
function componentTypeDataStyleDb(): Table<ModelComponentTypeStyle, ModelComponentTypeStyleKey> {
  return liveTable(modelComponentTypeDataStyleTable.name);
}

function sceneStyleDb(): Table<SceneStyle, string> {
  return liveTable(sceneStyleTable.name);
}

// Keyed by an auto-incremented number
function cameraPositionsDb(): Table<CameraPositionRecord, CameraPositionId> {
  return liveTable(cameraPositionsTable.name);
}

function treeviewConfigDb(): Table<TreeviewConfigRecord, TreeviewConfigId> {
  return liveTable(treeviewConfigTable.name);
}

// Runs `scope` in one read-write transaction over `tables`: its writes all apply, or none do.
// Only database calls may be awaited inside `scope`, or Dexie commits the transaction early.
async function writeTransaction<Result>(
  tables: readonly Table[],
  scope: () => Promise<Result>,
): Promise<Result> {
  const result = await currentInstance().transaction("rw", [...tables], scope);
  return result;
}

export {
  Database,
  cameraPositionsDb,
  componentDataStyleDb,
  componentTypeDataStyleDb,
  dataDb,
  dataStyleDb,
  database,
  getTable,
  modelComponentsDb,
  modelComponentsRelationDb,
  sceneStyleDb,
  treeviewConfigDb,
  writeTransaction,
};
