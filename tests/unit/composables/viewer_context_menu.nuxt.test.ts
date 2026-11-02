// oxlint-disable vitest/require-mock-type-parameters
import { beforeEach, describe, expect, test, vi } from "vitest";
import { setupActivePinia } from "@ogw_tests/utils";
import { shallowRef } from "vue";
import { useDataStore } from "@ogw_front/stores/data";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useViewerContextMenu } from "@ogw_front/composables/viewer_context_menu";

vi.setConfig({ testTimeout: 10_000 });

describe("viewer context menu", () => {
  beforeEach(() => {
    setupActivePinia();
  });

  test("a basemap row opens the basemap menu without reading any data", async () => {
    const item = vi.spyOn(useDataStore(), "item");
    const openMenu = vi.spyOn(useMenuStore(), "openMenu");
    const { openTreeMenu } = useViewerContextMenu(
      shallowRef<HTMLElement>(document.createElement("div")),
      // oxlint-disable-next-line unicorn/no-null -- a template ref, null until the viewer is mounted
      shallowRef<null>(null),
    );
    const event = new MouseEvent("contextmenu");

    await openTreeMenu({ event, itemId: "basemap", context_type: "basemap" });
    await openTreeMenu({ event, itemId: "basemap:topo", context_type: "basemap" });

    expect(item).not.toHaveBeenCalled();
    expect(openMenu.mock.calls.map(([options]) => [options.id, options.meta_data])).toStrictEqual([
      ["basemap", { viewer_type: "basemap", geode_object_type: "Basemap" }],
      ["basemap:topo", { viewer_type: "basemap", geode_object_type: "Map" }],
    ]);
  });
});
