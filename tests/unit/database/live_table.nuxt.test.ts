import { Database, database, getTable } from "@ogw_internal/database/database.js";
import { describe, expect, test } from "vitest";

interface ConfigRecord {
  id: string;
  value: number;
}

const ROW: ConfigRecord = { id: "main", value: 1 };

describe("tables taken before tables are added", () => {
  test("keep reading and writing the reopened database", async () => {
    const fromGetTable = getTable<ConfigRecord>("treeview_config");
    const fromProxy = database.treeview_config;

    await Database.addTables({ live_table_test: "id" });

    await fromGetTable.put(ROW);
    expect(await fromGetTable.get("main")).toStrictEqual(ROW);
    expect(await fromProxy?.get("main")).toStrictEqual(ROW);
    expect(await getTable<ConfigRecord>("live_table_test").count()).toBe(0);
  });
});
