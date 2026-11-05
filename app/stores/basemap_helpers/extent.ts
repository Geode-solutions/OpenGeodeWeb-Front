import type { BasemapBuildResponse } from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { MapStyle } from "@ogw_front/utils/basemap_tree";

interface Extent {
  bounds: BasemapBuildResponse["bounds"];
  z: number;
}

const X_MIN = 0;
const X_MAX = 1;
const Y_MIN = 2;
const Y_MAX = 3;
const Z_MAX = 5;

function everyMap<Value>(value: Value): Record<MapStyle, Value> {
  return { satellite: value, plan: value, routes: value };
}

// Unscaled polydata bounds: the actor bounds would include the z scale
function boxesExtent(boxes: readonly (readonly number[])[]): Extent | undefined {
  if (boxes.length === 0) {
    return undefined;
  }
  function side(index: number): number[] {
    return boxes.map((box) => box[index] ?? 0);
  }
  return {
    bounds: {
      x_min: Math.min(...side(X_MIN)),
      y_min: Math.min(...side(Y_MIN)),
      x_max: Math.max(...side(X_MAX)),
      y_max: Math.max(...side(Y_MAX)),
    },
    // At the top of the data, like the ground above subsurface data, ready to drape surfaces
    z: Math.max(...side(Z_MAX)),
  };
}

export type { Extent };
export { boxesExtent, everyMap };
