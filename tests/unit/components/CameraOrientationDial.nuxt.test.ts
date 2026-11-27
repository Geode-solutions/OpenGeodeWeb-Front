// Third party imports
import { describe, expect, test, vi } from "vitest";

// Local imports
import {
  dialButton,
  dialOffset,
  mountCompassDial,
} from "@ogw_tests/unit/helpers/camera_orientation_dial";
import { cameraOrientations } from "@ogw_front/utils/camera_orientations";
import { orientationCubeStyle } from "@ogw_front/utils/orientation_cube_style";

const BUTTON_RADIUS = 82;
// The camera elevation flattens the dial down to the readable minimum of the scene compass
const MIN_TILT = 0.6;

vi.setConfig({ testTimeout: 10_000 });

describe("camera orientations", () => {
  test("read the world axes with the axes marker", () => {
    const labels = cameraOrientations("axes").map(({ label }) => label);
    expect(labels).toStrictEqual(["Z+", "Z-", "Y+", "Y-", "X+", "X-"]);
  });

  test("read the compass directions with the compass marker", () => {
    const orientations = cameraOrientations("compass");
    expect(orientations.map(({ label }) => label)).toStrictEqual([
      "Up",
      "Down",
      "N",
      "S",
      "E",
      "W",
    ]);
    // North is world +Y and east world +X, as on the scene compass
    expect(orientations.find(({ label }) => label === "N")?.value).toBe("yplus");
    expect(orientations.find(({ label }) => label === "E")?.value).toBe("xplus");
    expect(orientations.find(({ label }) => label === "N")?.tooltip).toBe("View from north");
  });

  test("tell up and down apart with the compass marker only", () => {
    const orientations = cameraOrientations("compass");
    expect(orientations.find(({ label }) => label === "Up")?.vertical).toBe("up");
    expect(orientations.find(({ label }) => label === "Down")?.vertical).toBe("down");
    expect(cameraOrientations("axes").every(({ vertical }) => vertical === undefined)).toBe(true);
  });
});

describe("orientation cube style", () => {
  test("follows the light theme: light faces, dark labels, inverted on hover", () => {
    const style = orientationCubeStyle({ surface: "#FFFFFF", "on-surface": "#000000" });
    expect(style.faceColor).toBe("rgba(217, 217, 217, 1)");
    expect(style.fontColor).toBe("rgba(0, 0, 0, 1)");
    expect(style.edgeColor).toBe("rgba(0, 0, 0, 0.4)");
    expect(style.hoveredFaceColor).toBe("rgba(0, 0, 0, 0.95)");
    expect(style.hoveredFontColor).toBe("rgba(255, 255, 255, 1)");
  });

  test("falls back on the dark cube without usable theme colors", () => {
    const style = orientationCubeStyle({ surface: undefined, "on-surface": "not a color" });
    expect(style.fontColor).toBe("rgba(255, 255, 255, 1)");
    expect(style.hoveredFontColor).toBe("rgba(33, 33, 33, 1)");
  });
});

describe("camera orientation dial", () => {
  test("turns the cardinal buttons with the camera heading", async () => {
    const wrapper = await mountCompassDial();
    // Looking east: east is ahead (top of the dial), north on the left, south on the right
    const east = dialOffset(wrapper, "XPlus");
    expect(east.x).toBeCloseTo(0);
    expect(east.y).toBeCloseTo(-BUTTON_RADIUS * MIN_TILT);
    expect(dialOffset(wrapper, "YPlus").x).toBeCloseTo(-BUTTON_RADIUS);
    expect(dialOffset(wrapper, "YMinus").x).toBeCloseTo(BUTTON_RADIUS);
    expect(dialOffset(wrapper, "XMinus").y).toBeCloseTo(BUTTON_RADIUS * MIN_TILT);
  });

  test("keeps up and down apart from the dial", async () => {
    const wrapper = await mountCompassDial();
    expect(dialOffset(wrapper, "ZPlus").y).toBeLessThan(0);
    expect(dialOffset(wrapper, "ZMinus").y).toBeGreaterThan(0);
    expect(dialOffset(wrapper, "ZPlus").x).toBe(dialOffset(wrapper, "ZMinus").x);
  });

  test("marks the north and selects the clicked orientation", async () => {
    const wrapper = await mountCompassDial();
    expect(dialButton(wrapper, "YPlus").classes()).toContain("north");
    expect(dialButton(wrapper, "YMinus").classes()).not.toContain("north");
    await dialButton(wrapper, "YPlus").trigger("click");
    expect(wrapper.emitted("select")).toStrictEqual([["yplus"]]);
  });
});
