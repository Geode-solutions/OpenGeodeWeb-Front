import type { MenuItems } from "@ogw_front/stores/menu_helpers/types";
import SolidEdgesOptions from "@ogw_front/components/Viewer/Solid/EdgesOptions.vue";
import SolidPointsOptions from "@ogw_front/components/Viewer/Solid/PointsOptions.vue";
import SolidPolygonsOptions from "@ogw_front/components/Viewer/Solid/PolygonsOptions.vue";
import SolidPolyhedraOptions from "@ogw_front/components/Viewer/Solid/SpecificPolyhedraOptions.vue";
import TetrahedralSolidTetrahedraOptions from "@ogw_front/components/Viewer/TetrahedralSolid/TetrahedraOptions.vue";
import TetrahedralSolidTrianglesOptions from "@ogw_front/components/Viewer/TetrahedralSolid/TrianglesOptions.vue";

const Solid_menu = [
  SolidPointsOptions,
  SolidEdgesOptions,
  SolidPolygonsOptions,
  SolidPolyhedraOptions,
];

const TetrahedralSolid_menu = [
  SolidPointsOptions,
  SolidEdgesOptions,
  TetrahedralSolidTrianglesOptions,
  TetrahedralSolidTetrahedraOptions,
];

const solidMenus: Record<string, MenuItems> = {
  HybridSolid3D: Solid_menu,
  PolyhedralSolid3D: Solid_menu,
  TetrahedralSolid3D: TetrahedralSolid_menu,
};

export { solidMenus };
