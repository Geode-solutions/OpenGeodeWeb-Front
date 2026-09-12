// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test } from "vitest";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

describe("treeview store state", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("initial state", () => {
    const treeviewStore = useTreeviewStore();
    expectTypeOf(treeviewStore.items).toBeArray();
  });
});

describe("treeview store actions", () => {
  test("addItem sorted check", () => {
    const treeviewStore = useTreeviewStore();
    const testItems = [
      {
        geode_object_type: "BRep",
        name: "test_brep.og_brep",
        id: "1",
        viewer_type: "model",
      },
      {
        geode_object_type: "BRep",
        name: "test_brep_2.og_brep",
        id: "2",
        viewer_type: "model",
      },
      {
        geode_object_type: "EdgedCurve2D",
        name: "test_edgedcurve.og_edc2d",
        id: "2",
        viewer_type: "mesh",
      },
    ];

    for (const testItem of testItems) {
      treeviewStore.addItem(
        testItem.geode_object_type,
        testItem.name,
        testItem.id,
        testItem.viewer_type,
      );
      const itemsCopy = [...treeviewStore.items];
      expect(treeviewStore.items).toStrictEqual(itemsCopy.toSorted());

      for (const item of treeviewStore.items) {
        const childrenCopy = [...item.children];
        expect(item.children).toStrictEqual(childrenCopy.toSorted());
      }
    }
    expect(treeviewStore.selection).toHaveLength(testItems.length);
  });
});
