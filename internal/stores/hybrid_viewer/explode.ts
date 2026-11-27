import type { Vector3, vtkCamera } from "./vtk_types";

const COORDINATES = 3;
const HALF_DIVISOR = 2;
const Z_OFFSET = 2;
const Z_MIN_BOUND = 4;
const Z_MAX_BOUND = 5;

interface WritablePoints {
  [index: number]: number;
  length: number;
}

// The light viewable shows the compact data: stretch it along z over the exploded data bounds, so the simplified view seen while the camera moves stays as tall and as high as the exploded data.
function explodeAlongZ(
  compactPoints: Float64Array,
  points: WritablePoints,
  explodedBounds: number[],
): void {
  let compactZMin = Infinity;
  let compactZMax = -Infinity;
  for (let index = Z_OFFSET; index < compactPoints.length; index += COORDINATES) {
    compactZMin = Math.min(compactZMin, compactPoints[index] ?? compactZMin);
    compactZMax = Math.max(compactZMax, compactPoints[index] ?? compactZMax);
  }
  const explodedZMin = explodedBounds[Z_MIN_BOUND] ?? compactZMin;
  const explodedZMax = explodedBounds[Z_MAX_BOUND] ?? compactZMax;
  const ratio =
    compactZMax > compactZMin ? (explodedZMax - explodedZMin) / (compactZMax - compactZMin) : 1;
  for (let index = 0; index < compactPoints.length; index += 1) {
    const coordinate = compactPoints[index] ?? 0;
    points[index] =
      index % COORDINATES === Z_OFFSET
        ? explodedZMin + (coordinate - compactZMin) * ratio
        : coordinate;
  }
}

function boundsCenter(bounds: number[]): Vector3 {
  const [xMin = 0, xMax = 0, yMin = 0, yMax = 0, zMin = 0, zMax = 0] = bounds;
  return [(xMin + xMax) / HALF_DIVISOR, (yMin + yMax) / HALF_DIVISOR, (zMin + zMax) / HALF_DIVISOR];
}

// The camera keeps its orientation and zoom, and moves with the center of the scene as it explodes
function followCenter(camera: vtkCamera, boundsBefore: number[], boundsAfter: number[]): void {
  const before = boundsCenter(boundsBefore);
  const after = boundsCenter(boundsAfter);
  const offset = after.map((value, axis) => value - (before[axis] ?? 0));
  const [focalX, focalY, focalZ] = camera.getFocalPoint();
  const [positionX, positionY, positionZ] = camera.getPosition();
  const [offsetX = 0, offsetY = 0, offsetZ = 0] = offset;
  camera.setFocalPoint(focalX + offsetX, focalY + offsetY, focalZ + offsetZ);
  camera.setPosition(positionX + offsetX, positionY + offsetY, positionZ + offsetZ);
}

export { explodeAlongZ, followCenter };
