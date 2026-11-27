// Third party imports
import { describe, expect, test, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import CameraOrientationDial from "@ogw_front/components/CameraOrientationDial.vue";
import { cameraOrientations } from "@ogw_front/utils/camera_orientations";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const CAMERA_DISTANCE = 10;
const CAMERA_HEIGHT = 5;
const BUTTON_RADIUS = 82;
// The camera elevation flattens the dial down to the readable minimum of the scene compass
const MIN_TILT = 0.6;

vi.setConfig({ testTimeout: 10_000 });

function button(wrapper: VueWrapper, vtkKey: string): ReturnType<VueWrapper["get"]> {
  return wrapper.get(`[data-testid="cameraOrientation${vtkKey}Button"]`);
}

function offset(wrapper: VueWrapper, vtkKey: string): { x: number; y: number } {
  const style = button(wrapper, vtkKey).attributes("style") ?? "";
  const top = /top: calc\(50% \+ (?<px>-?[\d.e-]+)px\)/u.exec(style)?.groups?.px;
  const left = /left: calc\(50% \+ (?<px>-?[\d.e-]+)px\)/u.exec(style)?.groups?.px;
  return { x: Number(left), y: Number(top) };
}

// Camera looking east from the west of the scene, a bit above it
async function mountDial(): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  Object.assign(useHybridViewerStore().camera_options, {
    position: [-CAMERA_DISTANCE, 0, CAMERA_HEIGHT],
    focal_point: [0, 0, 0],
    view_up: [0, 0, 1],
  });
  const wrapper = await mountSuspended(CameraOrientationDial, {
    props: { orientations: cameraOrientations("compass") },
    global: { plugins: [vuetify, pinia] },
  });
  return wrapper;
}

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
});

describe("camera orientation dial", () => {
  test("turns the cardinal buttons with the camera heading", async () => {
    const wrapper = await mountDial();
    // Looking east: east is ahead (top of the dial), north on the left, south on the right
    const east = offset(wrapper, "XPlus");
    expect(east.x).toBeCloseTo(0);
    expect(east.y).toBeCloseTo(-BUTTON_RADIUS * MIN_TILT);
    expect(offset(wrapper, "YPlus").x).toBeCloseTo(-BUTTON_RADIUS);
    expect(offset(wrapper, "YMinus").x).toBeCloseTo(BUTTON_RADIUS);
    expect(offset(wrapper, "XMinus").y).toBeCloseTo(BUTTON_RADIUS * MIN_TILT);
  });

  test("keeps up and down apart from the dial", async () => {
    const wrapper = await mountDial();
    expect(offset(wrapper, "ZPlus").y).toBeLessThan(0);
    expect(offset(wrapper, "ZMinus").y).toBeGreaterThan(0);
    expect(offset(wrapper, "ZPlus").x).toBe(offset(wrapper, "ZMinus").x);
  });

  test("marks the north and selects the clicked orientation", async () => {
    const wrapper = await mountDial();
    expect(button(wrapper, "YPlus").classes()).toContain("north");
    expect(button(wrapper, "YMinus").classes()).not.toContain("north");
    await button(wrapper, "YPlus").trigger("click");
    expect(wrapper.emitted("select")).toStrictEqual([["yplus"]]);
  });
});
