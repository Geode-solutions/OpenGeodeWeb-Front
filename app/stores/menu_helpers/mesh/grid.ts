import Grid2DCellsOptions from "@ogw_front/components/Viewer/Grid/2D/CellsOptions.vue";
import Grid2DEdgesOptions from "@ogw_front/components/Viewer/Grid/2D/EdgesOptions.vue";
import Grid2DPointsOptions from "@ogw_front/components/Viewer/Grid/2D/PointsOptions.vue";
import Grid3DCellsOptions from "@ogw_front/components/Viewer/Grid/3D/CellsOptions.vue";
import Grid3DEdgesOptions from "@ogw_front/components/Viewer/Grid/3D/EdgesOptions.vue";
import Grid3DPointsOptions from "@ogw_front/components/Viewer/Grid/3D/PointsOptions.vue";
import type { MenuItems } from "@ogw_front/stores/menu_helpers/types";

const Grid2D_menu = [Grid2DPointsOptions, Grid2DEdgesOptions, Grid2DCellsOptions];
const Grid3D_menu = [
  Grid3DPointsOptions,
  Grid3DEdgesOptions,
  // Grid3DFacetsOptions,
  Grid3DCellsOptions,
];

const gridMenus: Record<string, MenuItems> = {
  LightRegularGrid2D: Grid2D_menu,
  LightRegularGrid3D: Grid3D_menu,
  RegularGrid2D: Grid2D_menu,
  RegularGrid3D: Grid3D_menu,
};

export { gridMenus };
