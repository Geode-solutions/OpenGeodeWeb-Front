// oxlint-disable vitest/require-mock-type-parameters
import { afterEach, describe, expect, test, vi } from "vitest";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import {
  hideViewerMarkerRequest,
  resetOrientationMarkerVisibility,
  setOrientationMarkerVisibility,
  viewerOrientationMarker,
} from "@ogw_front/composables/orientation_overlay";
import { mockAs, setupActivePinia, vuetify } from "@ogw_tests/utils";
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import OrientationOverlay from "@ogw_front/components/Viewer/OrientationOverlay.vue";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

vi.setConfig({ testTimeout: 10_000 });

const DISTANCE = 10;
const HEIGHT = 5;
const VIEW_ANGLE = 30;
const OVERLAY = '[data-testid="orientationOverlay"]';
const AXES = '[data-testid="orientationGlobe"]';
const COMPASS = '[data-testid="orientationCompass"]';
const { set_orientation_widget } = viewer_schemas.opengeodeweb_viewer.viewer;

function setOrientationOverlay(enabled: boolean): void {
  // The resolved app config type holds the layer's literal default
  Object.assign(useAppConfig().ogwFront, { orientationOverlay: enabled });
}

// Camera looking east from the west of the scene, a bit above it
function setCamera(): void {
  Object.assign(useHybridViewerStore().camera_options, {
    position: [-DISTANCE, 0, HEIGHT],
    focal_point: [0, 0, 0],
    view_up: [0, 0, 1],
    view_angle: VIEW_ANGLE,
    clipping_range: [1, DISTANCE * DISTANCE],
    distance: Math.hypot(DISTANCE, HEIGHT),
  });
}

async function mountOverlay(): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  setCamera();
  const wrapper = await mountSuspended(OrientationOverlay, {
    global: { plugins: [vuetify, pinia] },
  });
  return wrapper;
}

function count(wrapper: VueWrapper, selector: string): number {
  return wrapper.findAll(selector).length;
}

describe("orientation overlay", () => {
  afterEach(() => {
    setOrientationOverlay(false);
    resetOrientationMarkerVisibility();
  });

  test("renders nothing when the app keeps the VTK marker", async () => {
    setOrientationOverlay(false);
    const wrapper = await mountOverlay();
    expect(count(wrapper, OVERLAY)).toBe(0);
  });

  test("renders the axes globe, whose labels align the camera", async () => {
    setOrientationOverlay(true);
    const wrapper = await mountOverlay();
    expect(count(wrapper, OVERLAY)).toBe(1);
    expect(count(wrapper, AXES)).toBe(1);
    expect(count(wrapper, COMPASS)).toBe(0);
    const hybridViewerStore = useHybridViewerStore();
    hybridViewerStore.setCameraOrientation = mockAs<typeof hybridViewerStore.setCameraOrientation>(
      vi.fn(),
    );
    // The globe itself is not a target: only the axis labels move the camera
    await wrapper.get('[data-testid="orientationGlobe-body"]').trigger("click");
    expect(hybridViewerStore.setCameraOrientation).not.toHaveBeenCalled();
    await wrapper.get('[data-testid="orientationGlobe-xplus"]').trigger("click");
    expect(hybridViewerStore.setCameraOrientation).toHaveBeenCalledWith("xplus");
  });

  test("hides with the orientation marker, the viewer keeping the visibility", async () => {
    setOrientationOverlay(true);
    const wrapper = await mountOverlay();
    const request = vi.fn(async () => {
      await Promise.resolve();
    });
    await setOrientationMarkerVisibility(false, request);
    await wrapper.vm.$nextTick();
    expect(request).toHaveBeenCalledWith({
      schema: viewer_schemas.opengeodeweb_viewer.viewer.axes,
      params: { visibility: false },
    });
    expect(count(wrapper, OVERLAY)).toBe(0);
    // A viewer reset shows its marker again
    resetOrientationMarkerVisibility();
    await wrapper.vm.$nextTick();
    expect(count(wrapper, OVERLAY)).toBe(1);
  });

  test("draws the axes globe in the scene text color", async () => {
    setOrientationOverlay(true);
    const wrapper = await mountOverlay();
    const { sceneStyle } = useDataStyleStore();
    useDataStyleState().sceneStyle.value = {
      ...sceneStyle,
      text: { ...sceneStyle.text, color: { red: 255, green: 255, blue: 255, alpha: 1 } },
    };
    await wrapper.vm.$nextTick();
    const globeStyle = wrapper.get(AXES).attributes("style");
    expect(globeStyle).toContain("--globe-ink: 255, 255, 255");
    // A light ink gets the dark strata, so the globe stays readable on a dark background
    expect(globeStyle).toContain("--globe-strata: #1F2E33");
  });

  test("renders the compass dial, which turns the camera to the north", async () => {
    setOrientationOverlay(true);
    const wrapper = await mountOverlay();
    useDataStyleState().sceneStyle.value = {
      ...useDataStyleStore().sceneStyle,
      orientation_widget: "compass",
    };
    await wrapper.vm.$nextTick();
    expect(count(wrapper, AXES)).toBe(0);
    const setCameraMock = vi.fn<(options: CameraOptions) => void>();
    const hybridViewerStore = useHybridViewerStore();
    hybridViewerStore.setCamera = setCameraMock;
    expect(count(wrapper, COMPASS)).toBe(1);
    await wrapper.get(COMPASS).trigger("click");
    const target = setCameraMock.mock.calls[0]?.[0];
    expect(target?.position[0]).toBeCloseTo(0);
    expect(target?.position[1]).toBeCloseTo(-DISTANCE);
    expect(target?.position[2]).toBeCloseTo(HEIGHT);
  });

  test("a compass letter turns the camera towards its direction", async () => {
    setOrientationOverlay(true);
    const wrapper = await mountOverlay();
    useDataStyleState().sceneStyle.value = {
      ...useDataStyleStore().sceneStyle,
      orientation_widget: "compass",
    };
    await wrapper.vm.$nextTick();
    const setCameraMock = vi.fn<(options: CameraOptions) => void>();
    useHybridViewerStore().setCamera = setCameraMock;
    // Looking south, the camera stands north of the scene
    await wrapper.get('[data-testid="orientationCompass-S"]').trigger("click");
    const target = setCameraMock.mock.calls[0]?.[0];
    expect(target?.position[0]).toBeCloseTo(0);
    expect(target?.position[1]).toBeCloseTo(DISTANCE);
    expect(target?.position[2]).toBeCloseTo(HEIGHT);
  });

  test("a compass click towards the direction already faced does not call the viewer", async () => {
    setOrientationOverlay(true);
    const wrapper = await mountOverlay();
    useDataStyleState().sceneStyle.value = {
      ...useDataStyleStore().sceneStyle,
      orientation_widget: "compass",
    };
    await wrapper.vm.$nextTick();
    const setCameraMock = vi.fn<(options: CameraOptions) => void>();
    useHybridViewerStore().setCamera = setCameraMock;
    // The camera looks east
    await wrapper.get('[data-testid="orientationCompass-E"]').trigger("click");
    expect(setCameraMock).not.toHaveBeenCalled();
  });
});

describe("orientation marker sent to the viewer", () => {
  afterEach(() => {
    setOrientationOverlay(false);
  });

  test("is none with the overlay, the scene style keeping the choice", async () => {
    setupActivePinia();
    setOrientationOverlay(true);
    expect(viewerOrientationMarker("compass")).toBe("none");
    expect(hideViewerMarkerRequest()).toStrictEqual({
      schema: set_orientation_widget,
      params: { marker: "none" },
    });
    const viewerStore = useViewerStore();
    viewerStore.request = mockAs<typeof viewerStore.request>(
      vi.fn(async (_args: unknown, callbacks: { response_function?: () => Promise<void> }) => {
        await callbacks.response_function?.();
      }),
    );
    const dataStyleStore = useDataStyleStore();
    await dataStyleStore.setSceneOrientationWidget("compass");
    expect(viewerStore.request).toHaveBeenCalledWith(
      { schema: set_orientation_widget, params: { marker: "none" } },
      // oxlint-disable-next-line no-unsafe-assignment -- expect.any(Function) is untyped by design
      { response_function: expect.any(Function) },
    );
    expect(dataStyleStore.sceneStyle.orientation_widget).toBe("compass");
  });

  test("keeps the choice when the viewer has no none marker", async () => {
    setupActivePinia();
    setOrientationOverlay(true);
    const viewerStore = useViewerStore();
    viewerStore.request = mockAs<typeof viewerStore.request>(
      vi.fn(async () => {
        await Promise.reject(new Error("unknown marker"));
      }),
    );
    const dataStyleStore = useDataStyleStore();
    // A project restore with an older viewer does not fail on the marker
    await expect(dataStyleStore.setSceneOrientationWidget("compass")).resolves.toBeUndefined();
    expect(dataStyleStore.sceneStyle.orientation_widget).toBe("compass");
  });
});
