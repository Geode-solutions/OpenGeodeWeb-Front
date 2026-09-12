// PointSet components
import PointSetPointsOptions from "@ogw_front/components/Viewer/PointSet/SpecificPointsOptions.vue";

// EdgedCurve components
import EdgedCurveEdgesOptions from "@ogw_front/components/Viewer/EdgedCurve/SpecificEdgesOptions.vue";
import EdgedCurvePointsOptions from "@ogw_front/components/Viewer/EdgedCurve/PointsOptions.vue";

// Surface components
import SurfaceEdgesOptions from "@ogw_front/components/Viewer/Surface/EdgesOptions.vue";
import SurfacePointsOptions from "@ogw_front/components/Viewer/Surface/PointsOptions.vue";
import SurfacePolygonsOptions from "@ogw_front/components/Viewer/Surface/PolygonsOptions.vue";

// TriangulatedSurface components
import TriangulatedSurfaceTrianglesOptions from "@ogw_front/components/Viewer/Surface/Triangulated/TrianglesOptions.vue";

// Grid 2D components
import Grid2DCellsOptions from "@ogw_front/components/Viewer/Grid/2D/CellsOptions.vue";
import Grid2DEdgesOptions from "@ogw_front/components/Viewer/Grid/2D/EdgesOptions.vue";
import Grid2DPointsOptions from "@ogw_front/components/Viewer/Grid/2D/PointsOptions.vue";

// Grid 3D components
import Grid3DCellsOptions from "@ogw_front/components/Viewer/Grid/3D/CellsOptions.vue";
import Grid3DEdgesOptions from "@ogw_front/components/Viewer/Grid/3D/EdgesOptions.vue";
import Grid3DPointsOptions from "@ogw_front/components/Viewer/Grid/3D/PointsOptions.vue";

// Solid components
import SolidEdgesOptions from "@ogw_front/components/Viewer/Solid/EdgesOptions.vue";
import SolidPointsOptions from "@ogw_front/components/Viewer/Solid/PointsOptions.vue";
import SolidPolygonsOptions from "@ogw_front/components/Viewer/Solid/PolygonsOptions.vue";
import SolidPolyhedraOptions from "@ogw_front/components/Viewer/Solid/SpecificPolyhedraOptions.vue";

// TetrahedralSolid components
import TetrahedralSolidTetrahedraOptions from "@ogw_front/components/Viewer/TetrahedralSolid/TetrahedraOptions.vue";
import TetrahedralSolidTrianglesOptions from "@ogw_front/components/Viewer/TetrahedralSolid/TrianglesOptions.vue";

// Model components
import ModelEdgesOptions from "@ogw_front/components/Viewer/Generic/Model/EdgesOptions.vue";
import ModelPointsOptions from "@ogw_front/components/Viewer/Generic/Model/PointsOptions.vue";
import ModelStyleOptions from "@ogw_front/components/Viewer/Generic/Model/ModelStyleOptions.vue";

import type { Component } from "vue";

type MenuItems = Component[];

interface MenuMetaData {
  viewer_type?: string;
  geode_object_type?: string;
  [key: string]: unknown;
}

const PointSet_menu = [PointSetPointsOptions];

const EdgedCurve_menu = [EdgedCurvePointsOptions, EdgedCurveEdgesOptions];

const PolygonalSurface_menu = [SurfacePointsOptions, SurfaceEdgesOptions, SurfacePolygonsOptions];

const TriangulatedSurface_menu = [
  SurfacePointsOptions,
  SurfaceEdgesOptions,
  TriangulatedSurfaceTrianglesOptions,
];

const Grid2D_menu = [Grid2DPointsOptions, Grid2DEdgesOptions, Grid2DCellsOptions];
const Grid3D_menu = [
  Grid3DPointsOptions,
  Grid3DEdgesOptions,
  // Grid3DFacetsOptions,
  Grid3DCellsOptions,
];

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

const BRep_menu = [ModelEdgesOptions, ModelPointsOptions, ModelStyleOptions];

const CrossSection_menu = [ModelEdgesOptions, ModelPointsOptions, ModelStyleOptions];

const ImplicitCrossSection_menu = [ModelEdgesOptions, ModelPointsOptions, ModelStyleOptions];
const ImplicitStructuralModel_menu = [ModelEdgesOptions, ModelPointsOptions, ModelStyleOptions];

const Section_menu = [ModelEdgesOptions, ModelPointsOptions, ModelStyleOptions];

const StructuralModel_menu = [ModelEdgesOptions, ModelPointsOptions, ModelStyleOptions];

const ModelComponent_menu = [ModelEdgesOptions, ModelPointsOptions, ModelStyleOptions];

const menusData: Record<string, Record<string, MenuItems>> = {
  mesh: {
    EdgedCurve2D: EdgedCurve_menu,
    EdgedCurve3D: EdgedCurve_menu,
    HybridSolid3D: Solid_menu,
    LightRegularGrid2D: Grid2D_menu,
    LightRegularGrid3D: Grid3D_menu,
    PointSet2D: PointSet_menu,
    PointSet3D: PointSet_menu,
    PolygonalSurface2D: PolygonalSurface_menu,
    PolygonalSurface3D: PolygonalSurface_menu,
    PolyhedralSolid3D: Solid_menu,
    RegularGrid2D: Grid2D_menu,
    RegularGrid3D: Grid3D_menu,
    TetrahedralSolid3D: TetrahedralSolid_menu,
    TriangulatedSurface2D: TriangulatedSurface_menu,
    TriangulatedSurface3D: TriangulatedSurface_menu,
  },
  model: {
    BRep: BRep_menu,
    CrossSection: CrossSection_menu,
    ImplicitCrossSection: ImplicitCrossSection_menu,
    ImplicitStructuralModel: ImplicitStructuralModel_menu,
    Section: Section_menu,
    StructuralModel: StructuralModel_menu,
  },
  model_component_type: {
    type: ModelComponent_menu,
  },
  model_component: {
    component: ModelComponent_menu,
  },
};

export const useMenuStore = defineStore("menu", () => {
  const menus = shallowRef(menusData);
  const display_menu = ref(false);
  const current_id = ref<string | undefined>(undefined);
  const menuX = ref(0);
  const menuY = ref(0);
  const containerWidth = ref(window.innerWidth);
  const containerHeight = ref(window.innerHeight);
  const containerTop = ref(0);
  const containerLeft = ref(0);
  const active_item_index = ref<number | undefined>(undefined);
  const current_meta_data = ref<MenuMetaData>({});

  function getMenuItems(
    objectType: string | undefined,
    geodeObject: string | undefined,
  ): MenuItems {
    if (!objectType || !geodeObject || !menus.value[objectType]) {
      return [];
    }
    return menus.value[objectType]?.[geodeObject] || [];
  }

  function closeMenu(): void {
    active_item_index.value = undefined;
    current_id.value = undefined;
    current_meta_data.value = {};
    menuX.value = 0;
    menuY.value = 0;
    display_menu.value = false;
  }

  async function openMenu(
    id: string,
    x: number | undefined,
    y: number | undefined,
    width: number,
    height: number,
    top: number,
    left: number,
    meta_data: MenuMetaData | undefined,
  ): Promise<void> {
    await closeMenu();

    if (meta_data) {
      const items = getMenuItems(meta_data.viewer_type, meta_data.geode_object_type);
      if (items.length === 0) {
        return;
      }
    }

    current_id.value = id;
    current_meta_data.value = meta_data || {};

    if (x !== undefined && y !== undefined) {
      menuX.value = x;
      menuY.value = y;
    }

    containerWidth.value = width;
    containerHeight.value = height;
    containerTop.value = top;
    containerLeft.value = left;

    display_menu.value = true;
  }

  function setMenuPosition(x: number, y: number): void {
    menuX.value = x;
    menuY.value = y;
  }

  function toggleItemOptions(index: number): void {
    if (active_item_index.value === index) {
      active_item_index.value = undefined;
    } else {
      active_item_index.value = index;
    }
  }

  const router = useRouter();
  watch(
    () => router.currentRoute.value.path,
    () => {
      if (display_menu.value || active_item_index.value !== null) {
        closeMenu();
      }
    },
  );

  return {
    display_menu,
    current_id,
    current_meta_data,
    menuX,
    menuY,
    containerWidth,
    containerHeight,
    containerTop,
    containerLeft,
    active_item_index,
    getMenuItems,
    closeMenu,
    openMenu,
    setMenuPosition,
    toggleItemOptions,
  };
});
