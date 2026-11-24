// Camera frame of the orientation overlay (Viewer/OrientationGlobe.vue), drawn by the front over the
// Viewer image. Pure math on the camera pose (position, focal point, view up): no vtk.js nor Vue here.

type Vec3 = readonly [number, number, number];

interface CameraPose {
  position: Vec3;
  focal_point: Vec3;
  view_up: Vec3;
}

// Camera frame in world coordinates: screen right, screen up, and the direction towards the viewer
interface ViewBasis {
  right: Vec3;
  upward: Vec3;
  toViewer: Vec3;
}

const EPSILON = 1e-9;
const VECTOR_SIZE = 3;

function subtract(first: Vec3, second: Vec3): Vec3 {
  return [first[0] - second[0], first[1] - second[1], first[2] - second[2]];
}

function cross(first: Vec3, second: Vec3): Vec3 {
  return [
    first[1] * second[2] - first[2] * second[1],
    first[2] * second[0] - first[0] * second[2],
    first[0] * second[1] - first[1] * second[0],
  ];
}

function normalize(vector: Vec3): Vec3 | undefined {
  const length = Math.hypot(...vector);
  if (length < EPSILON) {
    return undefined;
  }
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function isVec3(value: unknown): value is Vec3 {
  return (
    Array.isArray(value) &&
    value.length === VECTOR_SIZE &&
    value.every((item) => typeof item === "number" && Number.isFinite(item))
  );
}

// Reads a pose from the loosely typed camera options of the hybrid viewer store
function toCameraPose(options: Record<string, unknown>): CameraPose | undefined {
  const { position, focal_point, view_up } = options;
  if (!isVec3(position) || !isVec3(focal_point) || !isVec3(view_up)) {
    return undefined;
  }
  return { position, focal_point, view_up };
}

// Undefined for a degenerate camera (position on the focal point, view up along the view direction)
function cameraViewBasis(pose: CameraPose): ViewBasis | undefined {
  const toViewer = normalize(subtract(pose.position, pose.focal_point));
  if (!toViewer) {
    return undefined;
  }
  const right = normalize(cross(pose.view_up, toViewer));
  if (!right) {
    return undefined;
  }
  return { right, upward: cross(toViewer, right), toViewer };
}

export { cameraViewBasis, toCameraPose };
export type { CameraPose, Vec3, ViewBasis };
