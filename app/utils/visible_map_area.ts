type Vector3 = [number, number, number];

interface MapBounds {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

interface ViewCamera {
  position: Vector3;
  focal_point: Vector3;
  view_up: Vector3;
  view_angle: number;
  distance: number;
}

// About one tile level (x2): the map changes by steps, not at every small move
const DETAIL_RATIO = 1.5;
const TILE_SIZE = 256;
const DEGREES = 180;
const HALF = 2;

function sub(first: Vector3, second: Vector3): Vector3 {
  return [first[0] - second[0], first[1] - second[1], first[2] - second[2]];
}

function add(first: Vector3, second: Vector3, scale: number): Vector3 {
  return [first[0] + second[0] * scale, first[1] + second[1] * scale, first[2] + second[2] * scale];
}

function cross(first: Vector3, second: Vector3): Vector3 {
  return [
    first[1] * second[2] - first[2] * second[1],
    first[2] * second[0] - first[0] * second[2],
    first[0] * second[1] - first[1] * second[0],
  ];
}

function normalized(vector: Vector3): Vector3 {
  const length = Math.hypot(...vector);
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

// Where a corner ray meets the map plane, or, past the horizon, the base edge in its direction
function groundPoint(
  origin: Vector3,
  direction: Vector3,
  planeZ: number,
  reach: number,
): [number, number] {
  const distance = (planeZ - origin[2]) / direction[2];
  if (direction[2] < 0 && distance > 0) {
    return [origin[0] + direction[0] * distance, origin[1] + direction[1] * distance];
  }
  const flat = Math.hypot(direction[0], direction[1]) || 1;
  return [origin[0] + (direction[0] / flat) * reach, origin[1] + (direction[1] / flat) * reach];
}

// The part of the base map the screen shows, from the rays of its 4 corners
function visibleMapArea(
  camera: ViewCamera,
  aspect: number,
  planeZ: number,
  base: MapBounds,
): MapBounds | undefined {
  const forward = normalized(sub(camera.focal_point, camera.position));
  const right = normalized(cross(forward, camera.view_up));
  const upward = cross(right, forward);
  const halfHeight = Math.tan((camera.view_angle * Math.PI) / DEGREES / HALF);
  const halfWidth = halfHeight * aspect;
  const reach = Math.hypot(base.x_max - base.x_min, base.y_max - base.y_min);
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([column, row]) => {
    const direction = add(
      add(forward, right, (column ?? 0) * halfWidth),
      upward,
      (row ?? 0) * halfHeight,
    );
    return groundPoint(camera.position, direction, planeZ, reach);
  });
  const xValues = corners.map((corner) => corner[0]);
  const yValues = corners.map((corner) => corner[1]);
  const visibleArea = {
    x_min: Math.max(base.x_min, Math.min(...xValues)),
    y_min: Math.max(base.y_min, Math.min(...yValues)),
    x_max: Math.min(base.x_max, Math.max(...xValues)),
    y_max: Math.min(base.y_max, Math.max(...yValues)),
  };
  if (visibleArea.x_min >= visibleArea.x_max || visibleArea.y_min >= visibleArea.y_max) {
    return undefined;
  }
  return visibleArea;
}

// The ground size of one screen pixel at the focal point
function screenPixelGroundSize(camera: ViewCamera, viewportHeight: number): number {
  return (
    (HALF * camera.distance * Math.tan((camera.view_angle * Math.PI) / DEGREES / HALF)) /
    viewportHeight
  );
}

// Below this gain the detail would look the same as the base
function needsSharperMap(baseResolution: number, wanted: number): boolean {
  return baseResolution > DETAIL_RATIO * wanted;
}

// A detail map stays while the view keeps within its area and its step of resolution
// Whether the map area covers the whole visible area
function covers(area: MapBounds, visible: MapBounds): boolean {
  return (
    visible.x_min >= area.x_min &&
    visible.y_min >= area.y_min &&
    visible.x_max <= area.x_max &&
    visible.y_max <= area.y_max
  );
}

function stillSharp(
  detail: { bounds: MapBounds; columns: number },
  visible: MapBounds,
  wanted: number,
): boolean {
  const resolution = (detail.bounds.x_max - detail.bounds.x_min) / (detail.columns * TILE_SIZE);
  return (
    covers(detail.bounds, visible) &&
    resolution <= wanted * DETAIL_RATIO &&
    resolution >= wanted / DETAIL_RATIO
  );
}

export type { MapBounds, ViewCamera };
export { covers, needsSharperMap, screenPixelGroundSize, stillSharp, visibleMapArea };
