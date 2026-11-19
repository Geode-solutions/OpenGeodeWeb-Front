// Heading math of the compass overlay (Viewer/OrientationCompass.vue). Same convention as the VTK
// Compass of OpenGeodeWeb-Viewer (orientation_marker.py): north = world +Y, east = +X, up = +Z.
import type { CameraPose, Vec3, ViewBasis } from "@ogw_front/utils/orientation_gizmo";

const DEGREES_PER_HALF_TURN = 180;
const RADIANS_PER_DEGREE = Math.PI / DEGREES_PER_HALF_TURN;
// Under this horizontal length, the screen right is (nearly) vertical: no heading can be read
const MIN_HORIZONTAL_RIGHT = 1e-3;
// The dial is flattened with the camera elevation, down to this ratio so its letters stay readable
const MIN_COMPASS_TILT = 0.6;
// Under this heading gap in degrees, the camera already faces the direction: nothing to turn
const FACING_TOLERANCE = 0.5;
const FULL_TURN = 360;

interface DialPoint {
  x: number;
  y: number;
}

// Clockwise angle in degrees from north to the direction the camera looks at, on the ground plane.
// Read from the screen right vector, which stays horizontal both for side views and for views
// Straight down or up (where the view direction has no horizontal part). Undefined when the camera
// Is rolled until its right vector is vertical.
function compassHeading(basis: ViewBasis): number | undefined {
  const [rightX, rightY] = basis.right;
  if (Math.hypot(rightX, rightY) < MIN_HORIZONTAL_RIGHT) {
    return undefined;
  }
  // The ground direction the camera looks at is the screen right turned by a quarter turn
  return Math.atan2(-rightY, rightX) / RADIANS_PER_DEGREE;
}

// Vertical scale of the dial: 1 seen from straight above or below, flatter towards the horizon
function compassTilt(basis: ViewBasis): number {
  return Math.max(MIN_COMPASS_TILT, Math.abs(basis.toViewer[2]));
}

// SVG position (y downwards) of the dial point at the given clockwise angle from north, once the
// Dial is turned by -heading and flattened by tilt
function compassDialPoint(angle: number, radius: number, heading: number, tilt: number): DialPoint {
  const screenAngle = (angle - heading) * RADIANS_PER_DEGREE;
  return {
    x: radius * Math.sin(screenAngle),
    y: -radius * Math.cos(screenAngle) * tilt,
  };
}

// Whether the camera already looks towards the given heading, clockwise in degrees from north
function isFacing(basis: ViewBasis, targetHeading: number): boolean {
  const heading = compassHeading(basis);
  if (heading === undefined) {
    return false;
  }
  const gap = (((heading - targetHeading) % FULL_TURN) + FULL_TURN) % FULL_TURN;
  return Math.min(gap, FULL_TURN - gap) < FACING_TOLERANCE;
}

function rotateAroundZ(vector: Vec3, angle: number): Vec3 {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [vector[0] * cosine - vector[1] * sine, vector[0] * sine + vector[1] * cosine, vector[2]];
}

// Same camera turned around the vertical axis through its focal point so that it looks towards the
// Given heading, clockwise in degrees from north (keeps the elevation and the distance). Undefined when
// No heading can be read.
function facingCameraPose(
  pose: CameraPose,
  basis: ViewBasis,
  targetHeading: number,
): CameraPose | undefined {
  const heading = compassHeading(basis);
  if (heading === undefined) {
    return undefined;
  }
  // A counterclockwise turn by the heading difference brings the view direction to the target
  const angle = (heading - targetHeading) * RADIANS_PER_DEGREE;
  const [focalX, focalY, focalZ] = pose.focal_point;
  const offset = rotateAroundZ(
    [pose.position[0] - focalX, pose.position[1] - focalY, pose.position[2] - focalZ],
    angle,
  );
  return {
    focal_point: pose.focal_point,
    position: [focalX + offset[0], focalY + offset[1], focalZ + offset[2]],
    view_up: rotateAroundZ(pose.view_up, angle),
  };
}

function northUpCameraPose(pose: CameraPose, basis: ViewBasis): CameraPose | undefined {
  return facingCameraPose(pose, basis, 0);
}

export {
  MIN_COMPASS_TILT,
  compassDialPoint,
  compassHeading,
  compassTilt,
  facingCameraPose,
  isFacing,
  northUpCameraPose,
};
export type { DialPoint };
