import { cross, multiplyAccumulate, normalize, subtract } from "@kitware/vtk.js/Common/Core/Math";
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import type { Vector3 } from "@kitware/vtk.js/types";

interface MapBounds {
  x_min: number;
  y_min: number;
  x_max: number;
  y_max: number;
}

// A map built by the back: its area and its number of tile columns
interface MapGrid {
  bounds: MapBounds;
  columns: number;
}

type ViewCamera = Pick<
  CameraOptions,
  "position" | "focal_point" | "view_up" | "view_angle" | "distance"
>;

// About one tile level (x2): the map changes by steps, not at every small move
const DETAIL_RATIO = 1.5;
const TILE_SIZE = 256;
const DEGREES = 180;
const HALF = 2;

// The ground size of one pixel of the map
function mapResolution(grid: MapGrid): number {
  return (grid.bounds.x_max - grid.bounds.x_min) / (grid.columns * TILE_SIZE);
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
  const forward = subtract(camera.focal_point, camera.position, [0, 0, 0]);
  normalize(forward);
  const right = cross(forward, camera.view_up, [0, 0, 0]);
  normalize(right);
  const upward = cross(right, forward, [0, 0, 0]);
  const halfHeight = Math.tan((camera.view_angle * Math.PI) / DEGREES / HALF);
  const halfWidth = halfHeight * aspect;
  const reach = Math.hypot(base.x_max - base.x_min, base.y_max - base.y_min);
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([column = 0, row = 0]) => {
    const direction = multiplyAccumulate(forward, right, column * halfWidth, [0, 0, 0]);
    multiplyAccumulate(direction, upward, row * halfHeight, direction);
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

// Whether the map area covers the whole visible area
function covers(area: MapBounds, visible: MapBounds): boolean {
  return (
    visible.x_min >= area.x_min &&
    visible.y_min >= area.y_min &&
    visible.x_max <= area.x_max &&
    visible.y_max <= area.y_max
  );
}

// A detail map stays while the view keeps within its area and its step of resolution
function stillSharp(detail: MapGrid, visible: MapBounds, wanted: number): boolean {
  const resolution = mapResolution(detail);
  return (
    covers(detail.bounds, visible) &&
    resolution <= wanted * DETAIL_RATIO &&
    resolution >= wanted / DETAIL_RATIO
  );
}

export type { MapBounds, MapGrid, ViewCamera };
export {
  covers,
  mapResolution,
  needsSharperMap,
  screenPixelGroundSize,
  stillSharp,
  visibleMapArea,
};
