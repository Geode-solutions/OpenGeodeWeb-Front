// Third party imports
import { beforeEach, describe, expect, expectTypeOf, test } from "vitest";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

function sortByTitle(itemA: { title: string }, itemB: { title: string }): number {
  return itemA.title.localeCompare(itemB.title, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

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
        geode_id: "00000000-0000-0000-0000-000000000001",
        viewer_type: "model",
      },
      {
        geode_object_type: "BRep",
        name: "test_brep_2.og_brep",
        id: "2",
        geode_id: "00000000-0000-0000-0000-000000000002",
        viewer_type: "model",
      },
      {
        geode_object_type: "EdgedCurve2D",
        name: "test_edgedcurve.og_edc2d",
        id: "2",
        geode_id: "00000000-0000-0000-0000-000000000003",
        viewer_type: "mesh",
      },
    ];

    for (const testItem of testItems) {
      treeviewStore.addItem(
        testItem.geode_object_type,
        testItem.name,
        testItem.id,
        testItem.geode_id,
        testItem.viewer_type,
      );
      const itemsCopy = [...treeviewStore.items];
      expect(treeviewStore.items).toStrictEqual(itemsCopy.toSorted(sortByTitle));

      for (const item of treeviewStore.items) {
        const childrenCopy = [...item.children];
        expect(item.children).toStrictEqual(childrenCopy.toSorted(sortByTitle));
      }
    }
    expect(treeviewStore.selection).toHaveLength(testItems.length);
    const children = treeviewStore.items.flatMap((item) => item.children);
    expect(children.map((child) => child.geode_id).toSorted()).toStrictEqual(
      testItems.map((testItem) => testItem.geode_id).toSorted(),
    );
  });
});
