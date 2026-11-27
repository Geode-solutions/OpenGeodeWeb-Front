// Geometry of the orientation globe (Viewer/OrientationGlobe.vue): a sphere crossed by horizontal strata
// (latitude rings, horizontal in the world, so the tilt reads at a glance), the world axes from its
// Center and the north (+Y) on its equator. Pure math on the camera view basis: no vtk.js nor Vue here.
// SVG coordinates: origin at the globe center, y grows downwards.
import type { Angle, Coordinate } from "@ogw_front/types/geometry";
import type { DisplayText, Pixels } from "@ogw_front/types/ui";
import type { Vec3, ViewBasis } from "@ogw_front/utils/orientation_gizmo";
import type { CameraOrientation } from "@ogw_internal/stores/hybrid_viewer/camera_helpers";

type GlobeAxis = "x" | "y" | "z";

interface GlobeLabel {
  axis: GlobeAxis;
  // Text drawn at the end of the axis: X, Y or Z
  text: DisplayText;
  // Key of the camera orientation looking from this end (see camera_helpers ORIENTATIONS)
  key: CameraOrientation;
  // Projected end of the axis, on the sphere
  tipX: Coordinate;
  tipY: Coordinate;
  // Label position, outside the sphere along the projected axis
  x: Coordinate;
  y: Coordinate;
  // Component towards the viewer: 1 points at the viewer, -1 away from it
  depth: number;
  // The axis points (nearly) at or away from the viewer: its label sits next to the center
  foreshortened: boolean;
}

// The d attribute of an SVG path
type SvgPath = string;

interface RingPaths {
  front: SvgPath;
  back: SvgPath;
}

// A latitude ring of the globe, the equator drawn stronger
interface StrataRing extends RingPaths {
  equator: boolean;
}

// A point of the globe projected on the SVG, with its component towards the viewer
interface GlobePoint {
  x: Coordinate;
  y: Coordinate;
  depth: number;
}

const DEGREES_PER_HALF_TURN = 180;
const RADIANS_PER_DEGREE = Math.PI / DEGREES_PER_HALF_TURN;
const FULL_TURN_DEGREES = 360;
const RING_SEGMENTS = 96;
// Heights of the latitude rings (unit sphere), the equator in the middle
const STRATA_LINE_HEIGHT = 0.62;
const STRATA_LINES = [STRATA_LINE_HEIGHT, 0, -STRATA_LINE_HEIGHT] as const;
// Gap between the sphere and the labels, in SVG units
const LABEL_GAP = 11;
// Under this projected length (ratio of the radius), the axis points at the viewer
const FORESHORTENED_RATIO = 0.18;
const FORESHORTENED_OFFSET = 8;
const AXES: readonly { axis: GlobeAxis; vector: Vec3; key: CameraOrientation }[] = [
  { axis: "x", vector: [1, 0, 0], key: "xplus" },
  { axis: "y", vector: [0, 1, 0], key: "yplus" },
  { axis: "z", vector: [0, 0, 1], key: "zplus" },
];

function dot(first: Vec3, second: Vec3): number {
  return first[0] * second[0] + first[1] * second[1] + first[2] * second[2];
}

// Screen position of a point of the unit sphere (world coordinates) for a globe of the given radius
function projectOnGlobe(basis: ViewBasis, radius: Pixels, point: Vec3): [number, number, number] {
  return [
    radius * dot(point, basis.right),
    -radius * dot(point, basis.upward),
    dot(point, basis.toViewer),
  ];
}

function pathPoint(
  previous: boolean | undefined,
  current: boolean,
  x: Coordinate,
  y: Coordinate,
): SvgPath {
  const command = previous === current ? "L" : "M";
  return `${command}${x.toFixed(2)} ${y.toFixed(2)}`;
}

// Latitude ring at the given height of the unit sphere, split into its half facing the viewer and its
// Hidden half (drawn fainter)
function latitudeRing(basis: ViewBasis, radius: Pixels, height: Coordinate): RingPaths {
  const ringRadius = Math.sqrt(Math.max(0, 1 - height * height));
  let front = "";
  let back = "";
  let previous: boolean | undefined = undefined;
  for (let index = 0; index <= RING_SEGMENTS; index += 1) {
    const angle = (2 * Math.PI * index) / RING_SEGMENTS;
    const [x, y, depth] = projectOnGlobe(basis, radius, [
      ringRadius * Math.cos(angle),
      ringRadius * Math.sin(angle),
      height,
    ]);
    const facing = depth >= 0;
    if (facing) {
      front += pathPoint(previous, true, x, y);
    } else {
      back += pathPoint(previous === false ? false : undefined, false, x, y);
    }
    previous = facing;
  }
  return { front, back };
}

function strataRings(basis: ViewBasis, radius: Pixels): StrataRing[] {
  return STRATA_LINES.map((height) => {
    const { front, back } = latitudeRing(basis, radius, height);
    return { front, back, equator: height === 0 };
  });
}

// Axis labels, back to front so the nearest axis is drawn last
function globeLabels(basis: ViewBasis, radius: Pixels): GlobeLabel[] {
  const labels: GlobeLabel[] = [];
  for (const { axis, vector, key } of AXES) {
    const text = axis.toUpperCase();
    const [tipX, tipY, depth] = projectOnGlobe(basis, radius, vector);
    const length = Math.hypot(tipX, tipY);
    const foreshortened = length < radius * FORESHORTENED_RATIO;
    const scale = foreshortened ? 0 : (radius + LABEL_GAP) / length;
    labels.push({
      axis,
      text,
      key,
      tipX,
      tipY,
      x: foreshortened ? FORESHORTENED_OFFSET : tipX * scale,
      y: foreshortened ? -FORESHORTENED_OFFSET : tipY * scale,
      depth,
      foreshortened,
    });
  }
  return labels.toSorted((first, second) => first.depth - second.depth);
}

// North (+Y) on the equator
function northPoint(basis: ViewBasis, radius: Pixels): GlobePoint {
  const [x, y, depth] = projectOnGlobe(basis, radius, [0, 1, 0]);
  return { x, y, depth };
}

// Angle of the camera above the horizon, in degrees: 90 looking straight down
function cameraElevation(basis: ViewBasis): Angle {
  return Math.asin(Math.max(-1, Math.min(1, basis.toViewer[2]))) / RADIANS_PER_DEGREE;
}

// Geologist's reading of the view: azimuth of the view direction, then elevation ("N 030° · 25°")
function orientationReadout(heading: Angle, elevation: Angle): string {
  const azimuth = Math.round(
    ((heading % FULL_TURN_DEGREES) + FULL_TURN_DEGREES) % FULL_TURN_DEGREES,
  );
  const padded = String(azimuth % FULL_TURN_DEGREES).padStart(3, "0");
  return `N ${padded}° · ${Math.round(elevation)}°`;
}

export { cameraElevation, globeLabels, latitudeRing, northPoint, orientationReadout, strataRings };
export type { GlobeAxis, GlobeLabel, GlobePoint, RingPaths, StrataRing, SvgPath };
