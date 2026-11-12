import { Dexie, type Table } from "dexie";
import { BaseDatabase } from "./base_database";
import { ExtendedDatabase } from "./extended_database";

interface DatabaseContainer {
  instance: Dexie | undefined;
}

const databaseContainer: DatabaseContainer = { instance: undefined };

interface CurrentSchema {
  currentVersion: number;
  currentStores: Record<string, string>;
}

function tableStoreDefinition(table: Table): string {
  const keyPath = table.schema.primKey.src;
  const indexes = table.schema.indexes.map((index) => index.src);
  if (keyPath) {
    return [keyPath, ...indexes].join(",");
  }
  return indexes.join(",");
}

async function readCurrentSchema(): Promise<CurrentSchema> {
  const currentStores: Record<string, string> = { ...BaseDatabase.initialStores };
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

async function openExistingDatabase(
  currentVersion: number,
  currentStores: Record<string, string>,
): Promise<Dexie> {
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

  public static async addTable(tableName: string, schemaDefinition: string): Promise<void> {
    await this.addTables({ [tableName]: schemaDefinition });
  }

  public static async addTables(newTables: Record<string, string>): Promise<void> {
    const { currentVersion, currentStores } = await readCurrentSchema();

    const allExisting = Object.keys(newTables).every(
      (tableName) => currentStores[tableName] !== undefined,
    );

    // Set at module load time below; always defined by the time addTable/addTables runs.
    databaseContainer.instance?.close();

    if (allExisting) {
      databaseContainer.instance = await openExistingDatabase(currentVersion, currentStores);
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

function liveTable<TRow>(tableName: string): Table<TRow, string> {
  return new Proxy(
    {},
    {
      get(_target, prop: string | symbol): unknown {
        const table = currentInstance().table(tableName);
        const value: unknown = Reflect.get(table, prop, table);
        if (typeof value === "function") {
          // oxlint-disable-next-line no-unsafe-return
          return value.bind(table);
        }
        return value;
      },
    },
    // oxlint-disable-next-line no-unsafe-type-assertion -- the proxy forwards every access to a Dexie Table.
  ) as Table<TRow, string>;
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

// Callers cast to the row type they know a given table holds.
function getTable<TRow>(tableName: string): Table<TRow, string> {
  return liveTable<TRow>(tableName);
}

export { Database, database, getTable };
