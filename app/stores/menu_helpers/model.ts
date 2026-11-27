import type { MenusByObjectType } from "./types.js";
import ModelEdgesOptions from "@ogw_front/components/Viewer/Generic/Model/EdgesOptions.vue";
import ModelPointsOptions from "@ogw_front/components/Viewer/Generic/Model/PointsOptions.vue";
import ModelStyleOptions from "@ogw_front/components/Viewer/Generic/Model/ModelStyleOptions.vue";

const Model_menu = [ModelEdgesOptions, ModelPointsOptions, ModelStyleOptions];

const modelMenus: MenusByObjectType = {
  BRep: Model_menu,
  CrossSection: Model_menu,
  ImplicitCrossSection: Model_menu,
  ImplicitStructuralModel: Model_menu,
  Section: Model_menu,
  StructuralModel: Model_menu,
};

const modelComponentTypeMenus: MenusByObjectType = {
  type: Model_menu,
};

const modelComponentMenus: MenusByObjectType = {
  component: Model_menu,
};

export { modelComponentMenus, modelComponentTypeMenus, modelMenus };
