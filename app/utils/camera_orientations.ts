import type { Label, Tooltip } from "@ogw_front/types/ui";
import type { Angle } from "@ogw_front/types/geometry";
// Camera orientations of the orientation panel (CameraOrientation.vue). Each one looks from a world
// Axis; with the compass marker, the labels follow the scene compass (north = world +Y, east = +X,
// Up = +Z, see utils/orientation_compass.ts) instead of the axis names.
import type { CameraOrientationKey } from "@ogw_internal/stores/hybrid_viewer/camera_helpers";
import type { SceneOrientationWidget } from "@ogw_internal/stores/data_style/types";

const QUARTER_TURN = 90;
const HALF_TURN = 180;

// A type alias, not an interface: it is bound to the style of a button, whose CSS properties take an
// Index signature (custom properties) that interfaces do not satisfy
type PanelPosition = Record<"top" | "left", string>;

interface CameraOrientation {
  // Key of hybridViewerStore.setCameraOrientation
  value: CameraOrientationKey;
  face: string;
  vtkKey: string;
  // Rotation of the label on its cube face
  rotation: number;
  // Place around the cube in the panel with the axes marker
  position: PanelPosition;
  label: Label;
  tooltip: Tooltip;
  // Clockwise angle in degrees from north of the side it looks from, with the compass marker
  heading?: Angle;
  // Looks from above or below, with the compass marker
  vertical?: Vertical;
}

type Vertical = "up" | "down";

interface OrientationEntry {
  value: CameraOrientationKey;
  face: string;
  vtkKey: string;
  rotation: number;
  position: PanelPosition;
  axisLabel: Label;
  compassLabel: Label;
  // Side it looks from, as read in "View from ..."
  compassName: string;
  heading?: Angle;
  vertical?: Vertical;
}

const ORIENTATIONS: readonly OrientationEntry[] = [
  {
    value: "zplus",
    face: "top",
    vtkKey: "ZPlus",
    rotation: 0,
    position: { top: "15%", left: "50%" },
    axisLabel: "Z+",
    compassLabel: "Up",
    compassName: "above",
    vertical: "up",
  },
  {
    value: "zminus",
    face: "bottom",
    vtkKey: "ZMinus",
    rotation: 0,
    position: { top: "85%", left: "50%" },
    axisLabel: "Z-",
    compassLabel: "Down",
    compassName: "below",
    vertical: "down",
  },
  {
    value: "yplus",
    face: "front",
    vtkKey: "YPlus",
    rotation: HALF_TURN,
    position: { top: "35%", left: "22%" },
    axisLabel: "Y+",
    compassLabel: "N",
    compassName: "north",
    heading: 0,
  },
  {
    value: "yminus",
    face: "back",
    vtkKey: "YMinus",
    rotation: 0,
    position: { top: "65%", left: "78%" },
    axisLabel: "Y-",
    compassLabel: "S",
    compassName: "south",
    heading: HALF_TURN,
  },
  {
    value: "xplus",
    face: "right",
    vtkKey: "XPlus",
    rotation: QUARTER_TURN,
    position: { top: "35%", left: "78%" },
    axisLabel: "X+",
    compassLabel: "E",
    compassName: "east",
    heading: QUARTER_TURN,
  },
  {
    value: "xminus",
    face: "left",
    vtkKey: "XMinus",
    rotation: -QUARTER_TURN,
    position: { top: "65%", left: "22%" },
    axisLabel: "X-",
    compassLabel: "W",
    compassName: "west",
    heading: 3 * QUARTER_TURN,
  },
];

function cameraOrientations(marker: SceneOrientationWidget): CameraOrientation[] {
  const isCompass = marker === "compass";
  return ORIENTATIONS.map((entry) => ({
    value: entry.value,
    face: entry.face,
    vtkKey: entry.vtkKey,
    rotation: entry.rotation,
    position: entry.position,
    label: isCompass ? entry.compassLabel : entry.axisLabel,
    tooltip: isCompass ? `View from ${entry.compassName}` : `${entry.value} View`,
    heading: isCompass ? entry.heading : undefined,
    vertical: isCompass ? entry.vertical : undefined,
  }));
}

// The north is the brand orange, as on the scene compass
function isNorth(orientation: CameraOrientation): boolean {
  return orientation.heading === 0;
}

export { cameraOrientations, isNorth };
export type { CameraOrientation, Vertical };
