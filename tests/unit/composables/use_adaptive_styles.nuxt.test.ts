// Third party imports
import { describe, expect, test } from "vitest";

// Local imports
import { contrastFactor } from "@ogw_front/composables/use_adaptive_styles";

// A bright viewer background with the black edges of a mesh under the panel
const MESH_OVER_BRIGHT_BACKGROUND = { darkest: 0, brightest: 0.69 };
const BRIGHT_BACKGROUND = { darkest: 0.69, brightest: 0.69 };
const DARK_BACKGROUND = { darkest: 0.05, brightest: 0.05 };
// Over half the strongest glass
const STRONG_GLASS = 0.5;

describe("adaptive glass contrast", () => {
  test("light text needs the glass over the brightest pixel, even next to black edges", () => {
    expect(contrastFactor(MESH_OVER_BRIGHT_BACKGROUND, true)).toBeGreaterThan(STRONG_GLASS);
    expect(contrastFactor(BRIGHT_BACKGROUND, true)).toBeGreaterThan(STRONG_GLASS);
  });

  test("light text needs no glass over a dark backdrop", () => {
    expect(contrastFactor(DARK_BACKGROUND, true)).toBe(0);
  });

  test("dark text needs the glass over the darkest pixel", () => {
    expect(contrastFactor(MESH_OVER_BRIGHT_BACKGROUND, false)).toBe(1);
    expect(contrastFactor(BRIGHT_BACKGROUND, false)).toBe(0);
  });
});
