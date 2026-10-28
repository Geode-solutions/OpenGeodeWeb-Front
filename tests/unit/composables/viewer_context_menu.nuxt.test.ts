// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

// Local imports
import { setupActivePinia } from "@ogw_tests/utils";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useViewerContextMenu } from "@ogw_front/composables/viewer_context_menu";

const CLICK_X = 50;
const CLICK_Y = 60;
const OBJECT_MENU_RADIUS = 80;

describe("viewer context menu", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("opens the scene menu when nothing is picked", async () => {
    const container = shallowRef(document.createElement("div"));
    const get_viewer_id = vi
      .fn<() => Promise<{ id: undefined; viewer_id: undefined }>>()
      .mockResolvedValue({ id: undefined, viewer_id: undefined });
    const viewerUI = shallowRef({ get_viewer_id });
    const { openViewerMenu } = useViewerContextMenu(container, viewerUI);

    await openViewerMenu(new MouseEvent("contextmenu", { clientX: CLICK_X, clientY: CLICK_Y }));

    const menuStore = useMenuStore();
    expect(menuStore.display_menu).toBe(true);
    expect(menuStore.current_id).toBe("scene");
    expect(menuStore.current_meta_data).toStrictEqual({
      viewer_type: "scene",
      geode_object_type: "scene",
    });
    // No center button in the scene menu: its items sit closer together than object menus
    expect(menuStore.menuRadius).toBeLessThan(OBJECT_MENU_RADIUS);
  });

  test("keeps the scene menu closed when the overlapping picker is dismissed", async () => {
    const container = shallowRef(document.createElement("div"));
    const get_viewer_id = vi
      .fn<() => Promise<{ id: undefined; viewer_id: undefined; dismissed: boolean }>>()
      .mockResolvedValue({ id: undefined, viewer_id: undefined, dismissed: true });
    const viewerUI = shallowRef({ get_viewer_id });
    const { openViewerMenu } = useViewerContextMenu(container, viewerUI);

    await openViewerMenu(new MouseEvent("contextmenu", { clientX: CLICK_X, clientY: CLICK_Y }));

    expect(useMenuStore().display_menu).toBe(false);
  });
});
