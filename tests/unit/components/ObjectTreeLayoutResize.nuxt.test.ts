// Third party imports
import { describe, expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import Layout from "@ogw_front/components/Viewer/ObjectTree/Layout.vue";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const CONTAINER_WIDTH = 2000;
const START_X = 900;
// Far left of the start: the model column becomes narrower than the auto close threshold
const BELOW_THRESHOLD_X = 0;

function moveMouse(clientX: number): void {
  document.dispatchEvent(new MouseEvent("mousemove", { clientX }));
}

describe("object tree layout resize", () => {
  test("shrinking the model column collapses its last tree only", async () => {
    const pinia = setupActivePinia();
    const treeviewStore = useTreeviewStore();
    treeviewStore.addItem("BRep", "corbi", "a", "geode-a", "model");
    treeviewStore.displayAdditionalTree("a", "corbi", "BRep");
    treeviewStore.displayAdditionalTree("b", "cube", "BRep");
    const wrapper = await mountSuspended(Layout, {
      global: {
        plugins: [vuetify, pinia],
        stubs: { GlobalObjects: true, ModelTree: true },
      },
      props: { containerWidth: CONTAINER_WIDTH },
    });
    await wrapper.find(".total-resizer").trigger("mousedown", { clientX: START_X });
    moveMouse(BELOW_THRESHOLD_X);
    moveMouse(BELOW_THRESHOLD_X);
    document.dispatchEvent(new MouseEvent("mouseup"));
    const collapsed = treeviewStore.opened_views.map((view) => view.collapsed === true);
    expect(collapsed).toStrictEqual([false, false, true]);
    wrapper.unmount();
  });
});
