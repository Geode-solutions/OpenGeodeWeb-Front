// Third party imports
import { afterEach, describe, expect, test, vi } from "vitest";

// Local imports
import {
  SCENE_DEFAULT_BACKGROUND_COLOR,
  SCENE_DEFAULT_TEXT_COLOR,
} from "@ogw_front/utils/default_styles/constants";
import { getDefaultSceneStyle, setSceneColors } from "@ogw_front/utils/default_styles";
import { defaultBackgroundBrightness } from "@ogw_internal/stores/hybrid_viewer/brightness";

vi.setConfig({ testTimeout: 10_000 });

const BRAND_BACKGROUND = { red: 160, green: 180, blue: 187, alpha: 1 };
const BRAND_TEXT = { red: 31, green: 46, blue: 51, alpha: 1 };
// Mean of the red, green and blue channels of each background, from 0 to 1
const OGW_BACKGROUND_BRIGHTNESS = 0.706;
const BRAND_BACKGROUND_BRIGHTNESS = 0.689;

describe("default scene style", () => {
  afterEach(() => {
    setSceneColors({});
  });

  test("uses the OpenGeodeWeb colors when the app sets none", () => {
    const style = getDefaultSceneStyle();
    expect(style.background_color).toStrictEqual(SCENE_DEFAULT_BACKGROUND_COLOR);
    expect(style.text.color).toStrictEqual(SCENE_DEFAULT_TEXT_COLOR);
  });

  test("uses the app scene colors", () => {
    setSceneColors({ background: BRAND_BACKGROUND, text: BRAND_TEXT });
    const style = getDefaultSceneStyle();
    expect(style.background_color).toStrictEqual(BRAND_BACKGROUND);
    expect(style.text.color).toStrictEqual(BRAND_TEXT);
  });

  test("copies the colors, so a style change does not alter the defaults", () => {
    setSceneColors({ background: BRAND_BACKGROUND });
    getDefaultSceneStyle().background_color.red = 0;
    expect(getDefaultSceneStyle().background_color).toStrictEqual(BRAND_BACKGROUND);
  });

  test("gives the brightness of the app background until a viewer image is sampled", () => {
    expect(defaultBackgroundBrightness()).toBeCloseTo(OGW_BACKGROUND_BRIGHTNESS);
    setSceneColors({ background: BRAND_BACKGROUND });
    expect(defaultBackgroundBrightness()).toBeCloseTo(BRAND_BACKGROUND_BRIGHTNESS);
  });
});
