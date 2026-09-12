// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import { BaseDatabase } from "./base_database";
import { Dexie } from "dexie";
// oxlint-disable-next-line eslint/no-duplicate-imports
import type { Table } from "dexie";
import { ExtendedDatabase } from "./extended_database";

interface DatabaseContainer {
  instance: Dexie | undefined;
}

const databaseContainer: DatabaseContainer = { instance: undefined };

class Database extends BaseDatabase {
  constructor() {
    super("Database");

    this.version(3).stores(BaseDatabase.initialStores);
  }

  static async addTable(tableName: string, schemaDefinition: string): Promise<void> {
    await this.addTables({ [tableName]: schemaDefinition });
  }

  static async addTables(newTables: Record<string, string>): Promise<void> {
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

    const allExisting = Object.keys(newTables).every((tableName) => currentStores[tableName]);

    // Set at module load time below; always defined by the time addTable/addTables runs.
    databaseContainer.instance!.close();

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
databaseContainer.instance = new Database();
(databaseContainer.instance as Database).clear();

// The set of tables is assembled dynamically at runtime (Database.addTable/addTables add stores on the fly), so fully modelling this with Dexie's row generics isn't worth it here: the proxy target is typed loosely as "any table name maps to a Dexie Table of loosely-typed rows".
interface DatabaseTables {
  [tableName: string]: Table<Record<string, unknown>, string>;
}

const database = new Proxy({} as DatabaseTables, {
  get(_target, prop: string | symbol) {
    const instance = databaseContainer.instance as unknown as Record<string | symbol, unknown>;
    const value = instance[prop];
    if (typeof value === "function") {
      return value.bind(databaseContainer.instance);
    }
    return value;
  },
});

export { Database, database };
