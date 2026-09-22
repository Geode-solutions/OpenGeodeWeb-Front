import type { Bounds } from "@kitware/vtk.js/types";
import type vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import type { vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";

const AXIS_SCALE = 0.45;
const SIZE_RATIO = 0.1;
const DEBOUNCE_DELAY = 200;
const CHANGE_THRESHOLD = 1e-4;
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

function getPlaneCssColor(index: number): string {
  const rgb = PLANE_COLORS[index % PLANE_COLORS.length] ?? COLOR_BLUE;
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

function computeSceneBounds(actors: readonly Readonly<vtkActor>[]): Bounds {
  let bounds: Bounds = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
  for (const actor of actors) {
    const boundsOfActor = actor.getBounds();
    bounds = [
      Math.min(bounds[0], boundsOfActor[0]),
      Math.max(bounds[1], boundsOfActor[1]),
      Math.min(bounds[2], boundsOfActor[2]),
      Math.max(bounds[3], boundsOfActor[3]),
      Math.min(bounds[4], boundsOfActor[4]),
      Math.max(bounds[5], boundsOfActor[5]),
    ];
  }
  return bounds;
}

interface SceneBoundsInfo {
  readonly center: readonly number[];
  readonly cubicBounds: readonly number[];
}

function computeSceneBoundsInfo(actors: readonly Readonly<vtkActor>[]): SceneBoundsInfo {
  if (actors.length === 0) {
    return { center: [0, 0, 0], cubicBounds: [-1, 1, -1, 1, -1, 1] };
  }
  const [xmin, xmax, ymin, ymax, zmin, zmax] = computeSceneBounds(actors);
  const center = [
    Number(((xmin + xmax) / 2).toFixed(4)),
    Number(((ymin + ymax) / 2).toFixed(4)),
    Number(((zmin + zmax) / 2).toFixed(4)),
  ];

  const maxActorExtent = Math.max(
    ...actors.map((actor: Readonly<vtkActor>) => {
      const bounds = actor.getBounds();
      return Math.max(bounds[1] - bounds[0], bounds[3] - bounds[2], bounds[5] - bounds[4]);
    }),
  );
  const halfExtent = maxActorExtent / 2;
  const [centerX = 0, centerY = 0, centerZ = 0] = center;
  const cubicBounds = [
    centerX - halfExtent,
    centerX + halfExtent,
    centerY - halfExtent,
    centerY + halfExtent,
    centerZ - halfExtent,
    centerZ + halfExtent,
  ];
  return { center, cubicBounds };
}

interface ActorEntry {
  readonly actor: Readonly<vtkActor>;
}

interface MainCameraOptions {
  readonly focal_point?: readonly number[];
  readonly position?: readonly number[];
  readonly view_up?: readonly number[];
}

function resolveActiveActors(
  targetAllVisible: boolean,
  allItems: readonly { readonly id: string }[],
  selectedDatasetIds: readonly string[],
  hybridDb: Readonly<Record<string, ActorEntry | undefined>>,
): Readonly<vtkActor>[] {
  const targetIds = targetAllVisible
    ? allItems.map((item: Readonly<{ id: string }>) => item.id)
    : selectedDatasetIds;
  const targeted = targetIds
    .map((id) => hybridDb[id]?.actor)
    .filter(
      (actor: Readonly<vtkActor> | undefined): actor is Readonly<vtkActor> => actor !== undefined,
    );
  if (targeted.length > 0) {
    return targeted;
  }
  return Object.values(hybridDb)
    .filter(
      (entry: Readonly<ActorEntry> | undefined): entry is Readonly<ActorEntry> =>
        entry !== undefined,
    )
    .map((entry: Readonly<ActorEntry>) => entry.actor);
}

function computeNormalizedViewDirection(
  focalPoint: readonly number[],
  position: readonly number[],
): readonly number[] | undefined {
  const dir = [
    (position[0] ?? 0) - (focalPoint[0] ?? 0),
    (position[1] ?? 0) - (focalPoint[1] ?? 0),
    (position[2] ?? 0) - (focalPoint[2] ?? 0),
  ];
  const dirLen = Math.hypot(...dir);
  if (dirLen === 0) {
    return undefined;
  }
  return dir.map((component) => component / dirLen);
}

// Aligns the local clipping-plane preview camera onto the same viewing direction as the
// Main viewer camera, re-centered on the clipped scene's bounds.
function alignCameraToMainCamera(
  camera: Readonly<vtkCamera>,
  mainCam: Readonly<MainCameraOptions>,
  center: readonly number[],
): void {
  if (!mainCam.focal_point || !mainCam.position) {
    return;
  }
  const normDir = computeNormalizedViewDirection(mainCam.focal_point, mainCam.position);
  if (!normDir) {
    return;
  }
  const distance = camera.getDistance();
  camera.setFocalPoint(center[0] ?? 0, center[1] ?? 0, center[2] ?? 0);
  camera.setPosition(
    (center[0] ?? 0) + (normDir[0] ?? 0) * distance,
    (center[1] ?? 0) + (normDir[1] ?? 0) * distance,
    (center[2] ?? 0) + (normDir[2] ?? 0) * distance,
  );
  if (mainCam.view_up) {
    const [viewUpX = 0, viewUpY = 0, viewUpZ = 0] = mainCam.view_up;
    camera.setViewUp(viewUpX, viewUpY, viewUpZ);
  }
}

export {
  AXIS_SCALE,
  SIZE_RATIO,
  DEBOUNCE_DELAY,
  CHANGE_THRESHOLD,
  PLANE_COLORS,
  DEFAULT_NORMALS,
  getPlaneCssColor,
  hasPlaneChanged,
  getPlaneStyle,
  computeSceneBounds,
  computeSceneBoundsInfo,
  resolveActiveActors,
  alignCameraToMainCamera,
};

export type { SceneBoundsInfo, MainCameraOptions };
