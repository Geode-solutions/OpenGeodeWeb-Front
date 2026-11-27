import EdgedCurveEdgesOptions from "@ogw_front/components/Viewer/EdgedCurve/SpecificEdgesOptions.vue";
import EdgedCurvePointsOptions from "@ogw_front/components/Viewer/EdgedCurve/PointsOptions.vue";
import type { MenusByObjectType } from "@ogw_front/stores/menu_helpers/types";

const EdgedCurve_menu = [EdgedCurvePointsOptions, EdgedCurveEdgesOptions];

const edgedCurveMenus: MenusByObjectType = {
  EdgedCurve2D: EdgedCurve_menu,
  EdgedCurve3D: EdgedCurve_menu,
};

export { edgedCurveMenus };
