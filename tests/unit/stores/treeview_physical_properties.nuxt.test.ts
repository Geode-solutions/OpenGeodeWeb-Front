// Third party imports
import { beforeEach, describe, expect, test } from "vitest";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const MODEL_ID = "a";
const OTHER_MODEL_ID = "b";
const PHYSICAL_PROPERTIES_VIEW_ID = "a:physical_properties";

function view(
  id: string,
):
  | { type: string; model_id?: string; title: string; color?: string; collapsed?: boolean }
  | undefined {
  return useTreeviewStore().opened_views.find((openedView) => openedView.id === id);
}

describe("treeview store physical properties tree", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("the physical properties of a model open in their own tree, closed by the same button", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayPhysicalPropertiesTree(MODEL_ID, "corbi", "BRep");
    expect(view(PHYSICAL_PROPERTIES_VIEW_ID)).toMatchObject({
      type: "physical_properties",
      model_id: MODEL_ID,
      title: "corbi",
    });
    // The model tree stays closed
    expect(view(MODEL_ID)).toBeUndefined();
    treeviewStore.displayPhysicalPropertiesTree(MODEL_ID, "corbi", "BRep");
    expect(view(PHYSICAL_PROPERTIES_VIEW_ID)).toBeUndefined();
  });

  test("the trees of a model share its color, other models get another one", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayPhysicalPropertiesTree(MODEL_ID, "corbi", "BRep");
    treeviewStore.displayAdditionalTree(OTHER_MODEL_ID, "cube", "BRep");
    treeviewStore.displayAdditionalTree(MODEL_ID, "corbi", "BRep");
    const color = view(PHYSICAL_PROPERTIES_VIEW_ID)?.color;
    expect(color).toBeDefined();
    expect(view(MODEL_ID)?.color).toBe(color);
    expect(view(OTHER_MODEL_ID)?.color).not.toBe(color);
    expect(treeviewStore.openedModelColor(MODEL_ID)).toBe(color);
    expect(treeviewStore.openedModelColor("closed")).toBeUndefined();
  });

  test("it collapses with the model trees", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree(MODEL_ID, "corbi", "BRep");
    treeviewStore.displayPhysicalPropertiesTree(MODEL_ID, "corbi", "BRep");
    treeviewStore.setAllCollapsed(true);
    expect(view(MODEL_ID)?.collapsed).toBe(true);
    expect(view(PHYSICAL_PROPERTIES_VIEW_ID)?.collapsed).toBe(true);
  });

  test("renaming the model renames both its trees", () => {
    const treeviewStore = useTreeviewStore();
    treeviewStore.displayAdditionalTree(MODEL_ID, "corbi", "BRep");
    treeviewStore.displayPhysicalPropertiesTree(MODEL_ID, "corbi", "BRep");
    treeviewStore.renameItem(MODEL_ID, "picasso");
    expect(view(MODEL_ID)?.title).toBe("picasso");
    expect(view(PHYSICAL_PROPERTIES_VIEW_ID)?.title).toBe("picasso");
  });
});
