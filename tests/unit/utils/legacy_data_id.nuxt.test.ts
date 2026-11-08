import { beforeEach, describe, expect, test } from "vitest";
import type { DataIdentified } from "@ogw_front/types/identifiers";
import { database } from "@ogw_internal/database/database.js";
import { fromLegacyDataId } from "@ogw_front/utils/legacy_data_id";
import { setupActivePinia } from "@ogw_tests/utils";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";

interface NamedData extends DataIdentified {
  name: string;
}

const DATA_ID = "data-1";
const GEODE_ID = "00000000-0000-0000-0000-000000000001";

describe("legacy data id", () => {
  test("a legacy row takes its id as data_id", () => {
    expect(fromLegacyDataId<NamedData>({ id: DATA_ID, name: "cube" })).toStrictEqual({
      data_id: DATA_ID,
      name: "cube",
    });
  });

  test("a row with a data_id is kept as it is", () => {
    const row = { data_id: DATA_ID, name: "cube" };
    expect(fromLegacyDataId(row)).toBe(row);
  });

  describe("stores importing a project saved with the legacy id", () => {
    beforeEach(() => {
      setupActivePinia();
    });

    test("the data store stores the components and relations with a data_id", async () => {
      const dataStore = useDataStore();
      await dataStore.importStores({
        modelComponents: [
          {
            id: DATA_ID,
            geode_id: GEODE_ID,
            type: "Surface",
            viewer_id: 1,
            name: "surface",
            is_active: true,
          },
        ],
        modelComponentsRelations: [{ id: DATA_ID, parent: "a", child: "b", type: "boundary" }],
      });

      const components = await database.model_components
        ?.where("data_id")
        .equals(DATA_ID)
        .toArray();
      expect(components).toHaveLength(1);
      expect(components?.[0]).not.toHaveProperty("id");
      const relations = await database.model_components_relation
        ?.where("data_id")
        .equals(DATA_ID)
        .toArray();
      expect(relations).toHaveLength(1);
      expect(relations?.[0]).not.toHaveProperty("id");
    });

    test("the data style store stores the styles with a data_id", async () => {
      const dataStyleStore = useDataStyleStore();
      await dataStyleStore.importStores({
        styles: { [DATA_ID]: { id: DATA_ID, visibility: true } },
        componentStyles: {},
        modelComponentTypeStyles: {},
      });

      const style = await database.data_style?.get(DATA_ID);
      expect(style).toStrictEqual({ data_id: DATA_ID, visibility: true });
    });
  });
});
