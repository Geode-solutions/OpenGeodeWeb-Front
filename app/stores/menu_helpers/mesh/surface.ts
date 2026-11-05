import type { MenuItems } from "@ogw_front/stores/menu_helpers/types";
import SurfaceEdgesOptions from "@ogw_front/components/Viewer/Surface/EdgesOptions.vue";
import SurfacePointsOptions from "@ogw_front/components/Viewer/Surface/PointsOptions.vue";
import SurfacePolygonsOptions from "@ogw_front/components/Viewer/Surface/PolygonsOptions.vue";
import TriangulatedSurfaceTrianglesOptions from "@ogw_front/components/Viewer/Surface/Triangulated/TrianglesOptions.vue";

const PolygonalSurface_menu = [SurfacePointsOptions, SurfaceEdgesOptions, SurfacePolygonsOptions];

const TriangulatedSurface_menu = [
  SurfacePointsOptions,
  SurfaceEdgesOptions,
  TriangulatedSurfaceTrianglesOptions,
];

const surfaceMenus: Record<string, MenuItems> = {
  PolygonalSurface2D: PolygonalSurface_menu,
  PolygonalSurface3D: PolygonalSurface_menu,
  TriangulatedSurface2D: TriangulatedSurface_menu,
  TriangulatedSurface3D: TriangulatedSurface_menu,
};

export { surfaceMenus };
