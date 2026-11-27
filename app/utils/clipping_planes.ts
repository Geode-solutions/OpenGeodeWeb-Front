import type { ColorRGBA, Opacity } from "@geode/opengeodeweb-viewer/schema_types";
import type { ClippingPlaneIndex } from "@ogw_front/composables/clipping_planes_widget_entries";
import type { Coordinates } from "@ogw_front/types/geometry";
import type { CssColor } from "@ogw_front/types/ui";

// The color of a clipping plane, as vtk.js takes it: red, green and blue between 0 and 1
type PlaneRgb = readonly number[];

// How a part of a clipping plane widget is drawn, as a vtk.js representation: 0 points, 1 wireframe, 2 surface
type Representation = number;

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

function getPlaneColor(index: ClippingPlaneIndex): PlaneRgb {
  return PLANE_COLORS[index % PLANE_COLORS.length] ?? COLOR_BLUE;
}

function getPlaneRgbaColor(index: ClippingPlaneIndex, alpha: Opacity): ColorRGBA {
  const [red = 0, green = 0, blue = 0] = getPlaneColor(index).map((channel) =>
    Math.round(channel * RGB_MAX_VALUE),
  );
  return { red, green, blue, alpha };
}

function getPlaneCssColor(index: ClippingPlaneIndex): CssColor {
  const rgb = getPlaneColor(index);
  return `rgb(${rgb.map((channel) => Math.round(channel * RGB_MAX_VALUE)).join(",")})`;
}

function hasPlaneChanged(
  origin: Readonly<Coordinates>,
  normal: Readonly<Coordinates>,
  currentOrigin: Readonly<Coordinates> | undefined,
  currentNormal: Readonly<Coordinates> | undefined,
): boolean {
  if (!currentOrigin) {
    return true;
  }
  return (
    origin.some((val, idx) => Math.abs(val - (currentOrigin[idx] ?? 0)) > CHANGE_THRESHOLD) ||
    normal.some((val, idx) => Math.abs(val - (currentNormal?.[idx] ?? 0)) > CHANGE_THRESHOLD)
  );
}

// How a part of a clipping plane widget is drawn: its opacity and its color
interface PlaneElementStyle {
  readonly opacity: Opacity;
  readonly color: PlaneRgb;
}

interface PlaneVisualState {
  readonly plane: PlaneElementStyle;
  readonly normal: PlaneElementStyle;
  readonly origin: PlaneElementStyle;
}

interface PlaneStyle {
  readonly active: PlaneVisualState;
  readonly inactive: PlaneVisualState;
  readonly static: {
    readonly display2D: { readonly representation: Representation };
    readonly outline: {
      readonly color: PlaneRgb;
      readonly opacity: Opacity;
      readonly representation: Representation;
      readonly interpolation: number;
    };
  };
}

function getPlaneStyle(rgb: PlaneRgb): PlaneStyle {
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
  getPlaneRgbaColor,
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
export type { PlaneRgb };
