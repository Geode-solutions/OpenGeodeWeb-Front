// PointSet components
import PointSetPointsOptions from "@ogw_front/components/Viewer/PointSet/SpecificPointsOptions"

// EdgedCurve components
import EdgedCurveEdgesOptions from "@ogw_front/components/Viewer/EdgedCurve/SpecificEdgesOptions"
import EdgedCurvePointsOptions from "@ogw_front/components/Viewer/EdgedCurve/PointsOptions"

// PolygonalSurface components
import PolygonalSurfaceEdgesOptions from "@ogw_front/components/Viewer/PolygonalSurface/EdgesOptions"
import PolygonalSurfacePointsOptions from "@ogw_front/components/Viewer/PolygonalSurface/PointsOptions"
import PolygonalSurfacePolygonsOptions from "@ogw_front/components/Viewer/PolygonalSurface/SpecificPolygonsOptions"

// TriangulatedSurface components
import TriangulatedSurfaceEdgesOptions from "@ogw_front/components/Viewer/TriangulatedSurface/EdgesOptions"
import TriangulatedSurfacePointsOptions from "@ogw_front/components/Viewer/TriangulatedSurface/PointsOptions"
import TriangulatedSurfaceTrianglesOptions from "@ogw_front/components/Viewer/TriangulatedSurface/TrianglesOptions"

// Grid 2D components
import Grid2DCellsOptions from "@ogw_front/components/Viewer/Grid/2D/CellsOptions"
import Grid2DEdgesOptions from "@ogw_front/components/Viewer/Grid/2D/EdgesOptions"
import Grid2DPointsOptions from "@ogw_front/components/Viewer/Grid/2D/PointsOptions"

// Grid 3D components
import Grid3DEdgesOptions from "@ogw_front/components/Viewer/Grid/3D/EdgesOptions"
import Grid3DPointsOptions from "@ogw_front/components/Viewer/Grid/3D/PointsOptions"
// import Grid3DFacetsOptions from "@ogw_front/components/Viewer/Grid/3D/FacetsOptions"
import Grid3DCellsOptions from "@ogw_front/components/Viewer/Grid/3D/CellsOptions"

// Solid components
import SolidEdgesOptions from "@ogw_front/components/Viewer/Solid/EdgesOptions"
import SolidPointsOptions from "@ogw_front/components/Viewer/Solid/PointsOptions"
import SolidPolygonsOptions from "@ogw_front/components/Viewer/Solid/PolygonsOptions"
import SolidPolyhedraOptions from "@ogw_front/components/Viewer/Solid/SpecificPolyhedraOptions"

// TetrahedralSolid components
import TetrahedralSolidTetrahedraOptions from "@ogw_front/components/Viewer/TetrahedralSolid/TetrahedraOptions"
import TetrahedralSolidTrianglesOptions from "@ogw_front/components/Viewer/TetrahedralSolid/TrianglesOptions"

// Model components
import ModelEdgesOptions from "@ogw_front/components/Viewer/Generic/Model/EdgesOptions"
import ModelPointsOptions from "@ogw_front/components/Viewer/Generic/Model/PointsOptions"

const PointSet_menu = [PointSetPointsOptions]

const EdgedCurve_menu = [EdgedCurvePointsOptions, EdgedCurveEdgesOptions]

const PolygonalSurface_menu = [
  PolygonalSurfacePointsOptions,
  PolygonalSurfaceEdgesOptions,
  PolygonalSurfacePolygonsOptions,
]

const TriangulatedSurface_menu = [
  TriangulatedSurfacePointsOptions,
  TriangulatedSurfaceEdgesOptions,
  TriangulatedSurfaceTrianglesOptions,
]

const Grid2D_menu = [
  Grid2DPointsOptions,
  Grid2DEdgesOptions,
  Grid2DCellsOptions,
]
const Grid3D_menu = [
  Grid3DPointsOptions,
  Grid3DEdgesOptions,
  // Grid3DFacetsOptions,
  Grid3DCellsOptions,
]

const Solid_menu = [
  SolidPointsOptions,
  SolidEdgesOptions,
  SolidPolygonsOptions,
  SolidPolyhedraOptions,
]

const TetrahedralSolid_menu = [
  SolidPointsOptions,
  SolidEdgesOptions,
  TetrahedralSolidTrianglesOptions,
  TetrahedralSolidTetrahedraOptions,
]

const BRep_menu = [ModelEdgesOptions, ModelPointsOptions]

const CrossSection_menu = [ModelEdgesOptions, ModelPointsOptions]

const ImplicitCrossSection_menu = [ModelEdgesOptions, ModelPointsOptions]
const ImplicitStructuralModel_menu = [ModelEdgesOptions, ModelPointsOptions]

const Section_menu = [ModelEdgesOptions, ModelPointsOptions]

const StructuralModel_menu = [ModelEdgesOptions, ModelPointsOptions]

const menusData = {
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
}

export const useMenuStore = defineStore("menu", () => {
  const menus = shallowRef(menusData)
  const display_menu = ref(false)
  const current_id = ref(null)
  const menuX = ref(0)
  const menuY = ref(0)
  const containerWidth = ref(window.innerWidth)
  const containerHeight = ref(window.innerHeight)
  const containerTop = ref(0)
  const containerLeft = ref(0)
  const active_item_index = ref(null)

  function getMenuItems(objectType, geodeObject) {
    if (!objectType || !geodeObject || !menus.value[objectType]) {
      return []
    }
    return menus.value[objectType][geodeObject] || []
  }

  function closeMenu() {
    active_item_index.value = null
    current_id.value = null
    menuX.value = 0
    menuY.value = 0
    display_menu.value = false
  }

  async function openMenu(id, x, y, width, height, top, left, meta_data) {
    await closeMenu()

    if (meta_data) {
      const items = getMenuItems(
        meta_data.viewer_type,
        meta_data.geode_object_type,
      )
      if (items.length === 0) {
        return
      }
    }

    current_id.value = id

    if (x !== undefined && y !== undefined) {
      menuX.value = x
      menuY.value = y
    }

    containerWidth.value = width
    containerHeight.value = height
    containerTop.value = top
    containerLeft.value = left

    display_menu.value = true
  }

  function setMenuPosition(x, y) {
    menuX.value = x
    menuY.value = y
  }

  function toggleItemOptions(index) {
    if (active_item_index.value === index) {
      active_item_index.value = null
    } else {
      active_item_index.value = index
    }
  }

  const router = useRouter()
  watch(
    () => router.currentRoute.value.path,
    () => {
      if (display_menu.value || active_item_index.value !== null) {
        closeMenu()
      }
    },
  )

  return {
    display_menu,
    current_id,
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
  }
})
