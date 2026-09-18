import { Dexie, type Table } from "dexie";
import { BaseDatabase } from "./base_database";
import { ExtendedDatabase } from "./extended_database";

interface DatabaseContainer {
  instance: Dexie | undefined;
}

const databaseContainer: DatabaseContainer = { instance: undefined };

class Database extends BaseDatabase {
  public constructor() {
    super("Database");

    this.version(3).stores(BaseDatabase.initialStores);
  }

  public static async addTable(tableName: string, schemaDefinition: string): Promise<void> {
    await this.addTables({ [tableName]: schemaDefinition });
  }

  public static async addTables(newTables: Record<string, string>): Promise<void> {
    let currentVersion = 1;
    let currentStores: Record<string, string> = { ...BaseDatabase.initialStores };

    if (await Dexie.exists("Database")) {
      const tempDb = new Dexie("Database");
      await tempDb.open();

      currentVersion = tempDb.verno;
      currentStores = { ...BaseDatabase.initialStores };

      for (const table of tempDb.tables) {
        const keyPath = table.schema.primKey.src;
        const indexes = table.schema.indexes.map((index) => index.src);
        const parts = keyPath ? [keyPath, ...indexes] : indexes;
        currentStores[table.name] = parts.join(",");
      }

      tempDb.close();
    }

    const allExisting = Object.keys(newTables).every(
      (tableName) => currentStores[tableName] !== undefined,
    );

    // Set at module load time below; always defined by the time addTable/addTables runs.
    databaseContainer.instance?.close();

    if (allExisting) {
      const existingDb = new Dexie("Database");
      for (let version = 1; version <= currentVersion; version += 1) {
        if (version === 1) {
          existingDb.version(1).stores(BaseDatabase.initialStores);
        } else {
          existingDb.version(version).stores(currentStores);
        }
      }
      await existingDb.open();
      databaseContainer.instance = existingDb;
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

const database = new Proxy<DatabaseTables>(
  {},
  {
    get(_target, prop: string | symbol): unknown {
      // The instance is a Dexie subclass whose tables are only known dynamically at runtime.
      // oxlint-disable-next-line no-unsafe-type-assertion
      const instance = databaseContainer.instance as unknown as Record<string | symbol, unknown>;
      const value = instance[prop];
      if (typeof value === "function") {
        // oxlint-disable-next-line no-unsafe-return
        return value.bind(databaseContainer.instance);
      }
      return value;
    },
  },
);

// The proxy only knows the loose DatabaseTables shape; callers cast to the row type they know a given table holds.
function getTable<TRow>(tableName: string): Table<TRow, string> {
  // oxlint-disable-next-line no-unsafe-type-assertion
  return database[tableName] as unknown as Table<TRow, string>;
}

export { Database, database, getTable };
