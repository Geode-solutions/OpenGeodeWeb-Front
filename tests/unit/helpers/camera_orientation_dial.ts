// Third party imports
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import CameraOrientationDial from "@ogw_front/components/CameraOrientationDial.vue";
import { cameraOrientations } from "@ogw_front/utils/camera_orientations";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const CAMERA_DISTANCE = 10;
const CAMERA_HEIGHT = 5;

type DialButton = ReturnType<VueWrapper["get"]>;

interface DialOffset {
  x: number;
  y: number;
}

function dialButton(wrapper: VueWrapper, vtkKey: string): DialButton {
  return wrapper.get(`[data-testid="cameraOrientation${vtkKey}Button"]`);
}

// Position of a button in pixels from the dial center, read from its style
function dialOffset(wrapper: VueWrapper, vtkKey: string): DialOffset {
  const style = dialButton(wrapper, vtkKey).attributes("style") ?? "";
  const top = /top: calc\(50% \+ (?<px>-?[\d.e-]+)px\)/u.exec(style)?.groups?.px;
  const left = /left: calc\(50% \+ (?<px>-?[\d.e-]+)px\)/u.exec(style)?.groups?.px;
  return { x: Number(left), y: Number(top) };
}

// The compass dial with a camera looking east from the west of the scene, a bit above it
async function mountCompassDial(): Promise<VueWrapper> {
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

export { dialButton, dialOffset, mountCompassDial };
