import type { MenuItems } from "@ogw_front/stores/menu_helpers/types";
import PointSetPointsOptions from "@ogw_front/components/Viewer/PointSet/SpecificPointsOptions.vue";

const PointSet_menu = [PointSetPointsOptions];

const pointSetMenus: Record<string, MenuItems> = {
  PointSet2D: PointSet_menu,
  PointSet3D: PointSet_menu,
};

export { pointSetMenus };
