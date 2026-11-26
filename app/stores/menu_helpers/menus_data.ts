import { modelComponentMenus, modelComponentTypeMenus, modelMenus } from "./model.js";
import type { MenuItems } from "./types.js";
import { basemapMenus } from "./basemap.js";
import { edgedCurveMenus } from "./mesh/edged_curve.js";
import { gridMenus } from "./mesh/grid.js";
import { imageMenus } from "./image.js";
import { pointSetMenus } from "./mesh/point_set.js";
import { sceneMenus } from "./scene.js";
import { solidMenus } from "./mesh/solid.js";
import { surfaceMenus } from "./mesh/surface.js";

const menusData: Record<string, Record<string, MenuItems>> = {
  image: imageMenus,
  mesh: {
    ...edgedCurveMenus,
    ...gridMenus,
    ...pointSetMenus,
    ...solidMenus,
    ...surfaceMenus,
  },
  model: modelMenus,
  model_component_type: modelComponentTypeMenus,
  model_component: modelComponentMenus,
  basemap: basemapMenus,
  scene: sceneMenus,
};

export { menusData };
export type { MenuItems } from "./types.js";
