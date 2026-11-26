// Third party imports
import { describe, expect, test, vi } from "vitest";

// The menus import their components: imported first, as in the app, the store has them all
import { useMenuStore } from "@ogw_front/stores/menu";

// Local imports
import { IMAGE_TYPES } from "@ogw_tests/unit/stores/image_style_helpers";
import ImageOptions from "@ogw_front/components/Viewer/Image/ImageOptions.vue";
import { setupActivePinia } from "@ogw_tests/utils";

vi.setConfig({ testTimeout: 10_000 });

describe("menu store", () => {
  setupActivePinia();

  test.each(IMAGE_TYPES)("a %s only gets the image options", (geode_object_type) => {
    expect(useMenuStore().getMenuItems("image", geode_object_type)).toStrictEqual([ImageOptions]);
  });

  test.each(IMAGE_TYPES)("a %s is no mesh anymore", (geode_object_type) => {
    expect(useMenuStore().getMenuItems("mesh", geode_object_type)).toStrictEqual([]);
  });
});
