import type { DatabaseVersion, TableSchemas } from "./types";
import { BaseDatabase } from "./base_database";

export class ExtendedDatabase extends BaseDatabase {
  public constructor(
    currentVersion: DatabaseVersion,
    currentStores: TableSchemas,
    newTables: TableSchemas,
  ) {
    super("Database");

    for (let version = 1; version <= currentVersion; version += 1) {
      if (version === 1) {
        this.version(1).stores(BaseDatabase.initialStores);
      } else {
        this.version(version).stores(currentStores);
      }
    }

    this.version(currentVersion + 1).stores({
      ...currentStores,
      ...newTables,
    });
  }
}
