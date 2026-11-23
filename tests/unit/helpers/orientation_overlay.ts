// Third party imports
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import OrientationOverlay from "@ogw_front/components/Viewer/OrientationOverlay.vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const CAMERA_DISTANCE = 10;
const CAMERA_HEIGHT = 5;
const CAMERA_VIEW_ANGLE = 30;

function setOrientationOverlay(enabled: boolean): void {
  // The resolved app config type holds the layer's literal default
  Object.assign(useAppConfig().ogwFront, { orientationOverlay: enabled });
}

// Camera looking east from the west of the scene, a bit above it
function setOverlayCamera(): void {
  Object.assign(useHybridViewerStore().camera_options, {
    position: [-CAMERA_DISTANCE, 0, CAMERA_HEIGHT],
    focal_point: [0, 0, 0],
    view_up: [0, 0, 1],
    view_angle: CAMERA_VIEW_ANGLE,
    clipping_range: [1, CAMERA_DISTANCE * CAMERA_DISTANCE],
    distance: Math.hypot(CAMERA_DISTANCE, CAMERA_HEIGHT),
  });
}

async function mountOrientationOverlay(): Promise<VueWrapper> {
  const pinia = setupActivePinia();
  setOverlayCamera();
  const wrapper = await mountSuspended(OrientationOverlay, {
    global: { plugins: [vuetify, pinia] },
  });
  return wrapper;
}

function countElements(wrapper: VueWrapper, selector: string): number {
  return wrapper.findAll(selector).length;
}

export {
  CAMERA_DISTANCE,
  CAMERA_HEIGHT,
  countElements,
  mountOrientationOverlay,
  setOrientationOverlay,
};
