import { Database, database, getTable } from "@ogw_internal/database/database.js";
import { describe, expect, test, vi } from "vitest";
import type { Dexie } from "dexie";

interface ConfigRecord {
  id: string;
  value: number;
}

const ROW: ConfigRecord = { id: "main", value: 1 };
const UPDATED_ROW: ConfigRecord = { id: "main", value: 2 };

vi.setConfig({ testTimeout: 5000 });

describe("tables taken before tables are added", () => {
  test("keep reading and writing the reopened database", async () => {
    const fromGetTable = getTable<ConfigRecord>("treeview_config");
    const fromProxy = database.treeview_config;

    await Database.addTables({ live_table_test: "id" });

    await fromGetTable.put(ROW);
    await expect(fromGetTable.get("main")).resolves.toStrictEqual(ROW);
    await expect(fromProxy?.get("main")).resolves.toStrictEqual(ROW);
    await expect(getTable<ConfigRecord>("live_table_test").count()).resolves.toBe(0);
  });

  test("can be given to a transaction", async () => {
    const table = getTable<ConfigRecord>("treeview_config");

    // oxlint-disable-next-line no-unsafe-type-assertion -- the shared database proxy forwards to a Dexie instance.
    await (database as unknown as Dexie).transaction("rw", table, async () => {
      await table.put(UPDATED_ROW);
    });

    await expect(table.get("main")).resolves.toStrictEqual(UPDATED_ROW);
  });
});
