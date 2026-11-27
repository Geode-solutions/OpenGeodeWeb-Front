// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";

// Local imports
import { mockAs, setupActivePinia } from "@ogw_tests/utils";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";

vi.setConfig({ testTimeout: 10_000 });

async function addItems(ids: string[]): Promise<void> {
  const dataStore = useDataStore();
  for (const id of ids) {
    // oxlint-disable-next-line no-await-in-loop
    await dataStore.addItem({
      data_id: id,
      geode_id: id,
      name: id,
      viewer_object_type: "mesh",
      geode_object_type: "PointSet3D",
    });
  }
}

function registeredIds(items: { data_id: string }[]): string[] {
  return items.map((registeredItem) => registeredItem.data_id);
}

describe("useDataStore - collections", () => {
  setupActivePinia();

  beforeEach(async () => {
    const dataStore = useDataStore();
    await dataStore.clear();
  });

  describe("registeredItems", () => {
    beforeEach(() => {
      const viewerStore = useViewerStore();
      viewerStore.request = mockAs<typeof viewerStore.request>(vi.fn().mockResolvedValue({}));
    });

    test("only lists the items registered in the viewer", async () => {
      const dataStore = useDataStore();
      await addItems(["registered", "pending"]);
      await dataStore.registerObject("registered", "registered");

      await vi.waitFor(() => {
        expect(registeredIds(dataStore.registeredItems)).toStrictEqual(["registered"]);
      });
      expect(dataStore.isRegistered("pending")).toBe(false);
    });

    test("updates when an item is registered or deregistered", async () => {
      const dataStore = useDataStore();
      await addItems(["first", "second"]);
      await dataStore.registerObject("first", "first");
      await dataStore.registerObject("second", "second");
      await vi.waitFor(() => {
        expect(registeredIds(dataStore.registeredItems)).toStrictEqual(["first", "second"]);
      });

      await dataStore.deregisterObject("first");
      expect(registeredIds(dataStore.registeredItems)).toStrictEqual(["second"]);
    });

    test("is emptied by clear", async () => {
      const dataStore = useDataStore();
      await addItems(["registered"]);
      await dataStore.registerObject("registered", "registered");

      await dataStore.clear();
      expect(dataStore.isRegistered("registered")).toBe(false);
    });
  });
});
