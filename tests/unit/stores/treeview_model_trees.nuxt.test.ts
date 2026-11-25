// Third party imports
import { beforeEach, describe, expect, test } from "vitest";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

function modelView(id: string): { collapsed?: boolean; opened: string[] } | undefined {
  return useTreeviewStore().opened_views.find((view) => view.id === id);
}

describe("treeview store collapsed model tree", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("collapsing a model tree keeps it open with its state", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.setOpened("a", ["Surface"]);
    treeviewStore.toggleCollapsed("a");
    expect(modelView("a")?.collapsed).toBe(true);
    expect(modelView("a")?.opened).toStrictEqual(["Surface"]);
    treeviewStore.toggleCollapsed("a");
    expect(modelView("a")?.collapsed).toBe(false);
  });

  test("the row button closes a collapsed model tree", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.toggleCollapsed("a");
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    expect(modelView("a")).toBeUndefined();
  });

  test("all the model trees collapse and show again at once", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.displayAdditionalTree("b", "cube", "BRep");
    treeviewStore.toggleCollapsed("a");
    treeviewStore.setAllCollapsed(true);
    expect(modelView("a")?.collapsed).toBe(true);
    expect(modelView("b")?.collapsed).toBe(true);
    expect(modelView("main")?.collapsed).toBeUndefined();
    treeviewStore.setAllCollapsed(false);
    expect(modelView("a")?.collapsed).toBe(false);
    expect(modelView("b")?.collapsed).toBe(false);
  });

  test("model trees move among themselves, the objects tree stays first", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.displayAdditionalTree("b", "cube", "BRep");
    treeviewStore.displayAdditionalTree("c", "test", "BRep");
    treeviewStore.moveView(3, 1);
    expect(treeviewStore.opened_views.map((view) => view.id)).toStrictEqual([
      "main",
      "c",
      "a",
      "b",
    ]);
    treeviewStore.moveView(1, 0);
    treeviewStore.moveView(0, 2);
    expect(treeviewStore.opened_views.map((view) => view.id)).toStrictEqual([
      "main",
      "c",
      "a",
      "b",
    ]);
  });

  test("the first model tree moves while the objects tree is closed", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.displayAdditionalTree("b", "cube", "BRep");
    treeviewStore.toggleView("main");
    treeviewStore.moveView(0, 1);
    expect(treeviewStore.opened_views.map((view) => view.id)).toStrictEqual(["b", "a"]);
  });
});
