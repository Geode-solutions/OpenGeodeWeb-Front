import type { ComputedRef, Ref } from "vue";
import { type ViewBasis, cameraViewBasis, toCameraPose } from "@ogw_front/utils/orientation_gizmo";
import { compassHeading, compassTilt } from "@ogw_front/utils/orientation_compass";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface CompassDial {
  basis: ComputedRef<ViewBasis | undefined>;
  // Clockwise angle in degrees from north to the direction the camera looks at
  heading: Ref<number>;
  // Vertical scale of the dial with the camera elevation
  tilt: Ref<number>;
}

// Dial of a compass following the viewer camera: the scene compass (Viewer/OrientationCompass.vue)
// And the compass layout of the orientation panel (CameraOrientationDial.vue) turn the same way.
// The last readable heading is kept while the camera is rolled until no heading can be read.
function useCompassDial(): CompassDial {
  const hybridViewerStore = useHybridViewerStore();
  const basis = computed(() => {
    const pose = toCameraPose(hybridViewerStore.camera_options);
    return pose && cameraViewBasis(pose);
  });
  const heading = ref(0);
  const tilt = ref(1);
  watch(
    basis,
    (value) => {
      if (!value) {
        return;
      }
      heading.value = compassHeading(value) ?? heading.value;
      tilt.value = compassTilt(value);
    },
    { immediate: true },
  );
  return { basis, heading, tilt };
}

export { useCompassDial };
export type { CompassDial };
