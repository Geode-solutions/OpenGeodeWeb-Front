// Node imports
import path from "node:path";

// Third party imports
import * as components from "vuetify/components";
import { describe, expect, test, vi } from "vitest";
import { createVuetify } from "vuetify";
import { mount } from "@vue/test-utils";

// Local imports
import {
  PHOSPHOR_ALIASES,
  phosphorIconClass,
  phosphorIconOptions,
} from "@ogw_front/utils/phosphor_icons";
import {
  PHOSPHOR_GLYPHS,
  iconNames,
  missingPhosphorIcons,
} from "@ogw_tests/unit/helpers/phosphor_glyphs";

vi.setConfig({ testTimeout: 10_000 });

const FRONT_ROOT = path.resolve(import.meta.dirname, "..", "..", "..");

describe("phosphor icon set", () => {
  test("renders the regular weight by default and keeps the extra classes", () => {
    expect(phosphorIconClass(" ph-camera ")).toBe("ph ph-camera");
    expect(phosphorIconClass("ph-circle-notch ogw-spin")).toBe("ph ph-circle-notch ogw-spin");
  });

  test("renders the fill weight when asked", () => {
    expect(phosphorIconClass("ph-fill ph-eye")).toBe("ph-fill ph-eye");
  });

  test("draws the Vuetify aliases with Phosphor glyphs", () => {
    const missing = Object.values(PHOSPHOR_ALIASES)
      .flatMap((icon) => iconNames(String(icon)))
      .filter((name) => !PHOSPHOR_GLYPHS.has(name));
    expect(missing).toStrictEqual([]);
    const vuetify = createVuetify({ components, icons: phosphorIconOptions() });
    const wrapper = mount(
      { template: '<v-icon icon="$close" />' },
      { global: { plugins: [vuetify] } },
    );
    expect(wrapper.classes()).toContain("ph");
    expect(wrapper.classes()).toContain("ph-x");
  });

  test("every icon written in the sources is a Phosphor glyph", () => {
    expect(missingPhosphorIcons(FRONT_ROOT, ["app", "internal"])).toStrictEqual([]);
  });
});
