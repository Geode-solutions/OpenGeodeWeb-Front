const AXIS_SCALE = 0.45;
const SIZE_RATIO = 0.1;
const DEBOUNCE_DELAY = 200;
const CHANGE_THRESHOLD = 1e-4;
const DEFAULT_PLANE_OPACITY = 0.1;
// oxlint-disable no-magic-numbers
const COLOR_BLUE = [0.12, 0.53, 0.9];
const COLOR_GREEN = [0.26, 0.63, 0.28];
const COLOR_ORANGE = [0.98, 0.55, 0];
const COLOR_PURPLE = [0.55, 0.14, 0.67];
const COLOR_RED = [0.9, 0.22, 0.21];
// oxlint-enable no-magic-numbers
const PLANE_COLORS = [COLOR_BLUE, COLOR_GREEN, COLOR_ORANGE, COLOR_PURPLE, COLOR_RED];
const NORMAL_X = [1, 0, 0];
const NORMAL_Y = [0, 1, 0];
const NORMAL_Z = [0, 0, 1];
const DEFAULT_NORMALS = [NORMAL_X, NORMAL_Y, NORMAL_Z];
const RGB_MAX_VALUE = 255;

function getPlaneColor(index: number): readonly number[] {
  return PLANE_COLORS[index % PLANE_COLORS.length] ?? COLOR_BLUE;
}

function getPlaneCssColor(index: number): string {
  const rgb = getPlaneColor(index);
  return `rgb(${rgb.map((channel) => Math.round(channel * RGB_MAX_VALUE)).join(",")})`;
}

function hasPlaneChanged(
  origin: readonly number[],
  normal: readonly number[],
  currentOrigin: readonly number[] | undefined,
  currentNormal: readonly number[] | undefined,
): boolean {
  if (!currentOrigin) {
    return true;
  }
  return (
    origin.some((val, idx) => Math.abs(val - (currentOrigin[idx] ?? 0)) > CHANGE_THRESHOLD) ||
    normal.some((val, idx) => Math.abs(val - (currentNormal?.[idx] ?? 0)) > CHANGE_THRESHOLD)
  );
}

interface PlaneVisualState {
  readonly plane: { readonly opacity: number; readonly color: readonly number[] };
  readonly normal: { readonly opacity: number; readonly color: readonly number[] };
  readonly origin: { readonly opacity: number; readonly color: readonly number[] };
}

interface PlaneStyle {
  readonly active: PlaneVisualState;
  readonly inactive: PlaneVisualState;
  readonly static: {
    readonly display2D: { readonly representation: number };
    readonly outline: {
      readonly color: readonly number[];
      readonly opacity: number;
      readonly representation: number;
      readonly interpolation: number;
    };
  };
}

function getPlaneStyle(rgb: readonly number[]): PlaneStyle {
  return {
    active: {
      plane: { opacity: 1, color: rgb },
      normal: { opacity: 1, color: rgb },
      origin: { opacity: 1, color: rgb },
    },
    inactive: {
      plane: { opacity: 0.5, color: rgb },
      normal: { opacity: 1, color: rgb },
      origin: { opacity: 1, color: rgb },
    },
    static: {
      display2D: { representation: 0 },
      outline: { color: [1, 1, 1], opacity: 1, representation: 1, interpolation: 0 },
    },
  };
}

export {
  AXIS_SCALE,
  SIZE_RATIO,
  DEBOUNCE_DELAY,
  CHANGE_THRESHOLD,
  DEFAULT_PLANE_OPACITY,
  PLANE_COLORS,
  DEFAULT_NORMALS,
  getPlaneColor,
  getPlaneCssColor,
  hasPlaneChanged,
  getPlaneStyle,
};
export {
  computeSceneBounds,
  computeSceneBoundsInfo,
  resolveActiveActors,
  alignCameraToMainCamera,
} from "./clipping_planes_scene";
export type { SceneBoundsInfo, MainCameraOptions } from "./clipping_planes_scene";
