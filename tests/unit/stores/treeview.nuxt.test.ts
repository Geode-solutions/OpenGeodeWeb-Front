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
        viewer_object_type: "model",
      },
      {
        geode_object_type: "BRep",
        name: "test_brep_2.og_brep",
        id: "2",
        geode_id: "00000000-0000-0000-0000-000000000002",
        viewer_object_type: "model",
      },
      {
        geode_object_type: "EdgedCurve2D",
        name: "test_edgedcurve.og_edc2d",
        id: "2",
        geode_id: "00000000-0000-0000-0000-000000000003",
        viewer_object_type: "mesh",
      },
    ];

    for (const testItem of testItems) {
      treeviewStore.addItem(
        testItem.geode_object_type,
        testItem.name,
        testItem.id,
        testItem.geode_id,
        testItem.viewer_object_type,
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

function viewColor(id: string): string | undefined {
  return useTreeviewStore().opened_views.find((view) => view.id === id)?.color;
}

describe("treeview store model tree link", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("each opened model tree gets its own color", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.displayAdditionalTree("b", "corbi", "BRep");
    expect(viewColor("a")).toBeDefined();
    expect(viewColor("b")).toBeDefined();
    expect(viewColor("a")).not.toBe(viewColor("b"));
  });

  test("a color stays with its tree when another one closes", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.displayAdditionalTree("b", "corbi", "BRep");
    const colorB = viewColor("b");
    treeviewStore.closeView("a");
    expect(viewColor("b")).toBe(colorB);
    // The freed color goes to the next tree, never the one still in use
    treeviewStore.displayAdditionalTree("c", "other", "BRep");
    expect(viewColor("c")).not.toBe(colorB);
  });

  test("model trees restored without a color get distinct ones", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.importStores({
      opened_views: [
        { type: "object", id: "main", title: "Objects", scrollTop: 0, opened: [] },
        { type: "component", id: "a", title: "corbi", scrollTop: 0, opened: [] },
        { type: "component", id: "b", title: "corbi", scrollTop: 0, opened: [] },
      ],
    });
    expect(viewColor("main")).toBeUndefined();
    expect(viewColor("a")).toBeDefined();
    expect(viewColor("b")).toBeDefined();
    expect(viewColor("a")).not.toBe(viewColor("b"));
  });

  test("hovered model is shared and cleared", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.setHoveredModel("a");
    expect(treeviewStore.hoveredModelId).toBe("a");
    treeviewStore.setHoveredModel(undefined);
    expect(treeviewStore.hoveredModelId).toBeUndefined();
  });

  test("closing a hovered view clears the hovered model", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.setHoveredModel("a");
    treeviewStore.closeView("a");
    expect(treeviewStore.hoveredModelId).toBeUndefined();
  });

  test("closing another view keeps the hovered model", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.setHoveredModel("b");
    treeviewStore.closeView("a");
    expect(treeviewStore.hoveredModelId).toBe("b");
  });

  test("removing a hovered data clears the hovered model", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.addItem("BRep", "corbi", "a", "geode-a", "model");
    treeviewStore.setHoveredModel("a");
    treeviewStore.removeItem("a");
    expect(treeviewStore.hoveredModelId).toBeUndefined();
  });
});
