const COORDINATES = 3;
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

export { explodeAlongZ };
