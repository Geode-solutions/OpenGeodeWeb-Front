// Local imports
import {
  type CameraPose,
  type Vec3,
  type ViewBasis,
  cameraViewBasis,
} from "@ogw_front/utils/orientation_gizmo";
import { type GlobeLabel, globeLabels } from "@ogw_front/utils/orientation_globe";
import {
  compassHeading,
  compassTilt,
  facingCameraPose,
  northUpCameraPose,
} from "@ogw_front/utils/orientation_compass";
import { assertDefined } from "@ogw_tests/utils";

const RADIUS = 30;
const ORIGIN: Vec3 = [0, 0, 0];

// Camera at position looking at the origin
function pose(position: Vec3, view_up: Vec3): CameraPose {
  return { position, focal_point: ORIGIN, view_up };
}

function basisOf(cameraPose: CameraPose): ViewBasis {
  return assertDefined(cameraViewBasis(cameraPose), "Expected a valid camera");
}

function headingFrom(position: Vec3, view_up: Vec3): number | undefined {
  return compassHeading(basisOf(pose(position, view_up)));
}

function labelsFrom(position: Vec3, view_up: Vec3): GlobeLabel[] {
  return globeLabels(basisOf(pose(position, view_up)), RADIUS);
}

function tiltFrom(position: Vec3, view_up: Vec3): number {
  return compassTilt(basisOf(pose(position, view_up)));
}

function northUpFrom(position: Vec3, view_up: Vec3): CameraPose {
  const cameraPose = pose(position, view_up);
  return assertDefined(northUpCameraPose(cameraPose, basisOf(cameraPose)));
}

function facingFrom(position: Vec3, view_up: Vec3, targetHeading: number): CameraPose {
  const cameraPose = pose(position, view_up);
  return assertDefined(facingCameraPose(cameraPose, basisOf(cameraPose), targetHeading));
}

export {
  ORIGIN,
  RADIUS,
  basisOf,
  facingFrom,
  headingFrom,
  labelsFrom,
  northUpFrom,
  pose,
  tiltFrom,
};
