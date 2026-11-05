import {
  type MapBounds,
  type ViewCamera,
  mapResolution,
  needsSharperMap,
  screenPixelGroundSize,
  visibleMapArea,
} from "@ogw_front/utils/visible_map_area";
import back_schemas, {
  type BasemapBuildResponse,
} from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import type { BasemapGrid } from "./builds.js";
import type { MapStyle } from "@ogw_front/utils/basemap_tree";
import { useBackStore } from "@ogw_front/stores/back";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface RenderWindowLike {
  getApiSpecificRenderWindow: () => { getSize: () => [number, number] };
}
interface CurrentView {
  visibleArea: MapBounds | undefined;
  wanted: number;
  sharperNeeded: boolean;
}

const MAX_DETAIL_PIXELS = 4096;

interface DetailView {
  viewportSize: () => [number, number] | undefined;
  currentView: (grid: BasemapGrid, size: readonly number[]) => CurrentView;
  detailRequest: (
    area: Readonly<{ maps: MapStyle[]; visibleArea: MapBounds; z: number }>,
    size: readonly number[],
  ) => Promise<BasemapBuildResponse | undefined>;
}

// The stores are taken once: a call still running after a project reset reaches its own stores
function useDetailView(): DetailView {
  const backStore = useBackStore();
  const crsStore = useCrsStore();
  const hybridViewerStore = useHybridViewerStore();

  function viewportSize(): [number, number] | undefined {
    // The store holds the render window in a holder: the vtk.js typing of its API is partial
    // oxlint-disable-next-line no-unsafe-type-assertion -- vtk.js render window API boundary
    const renderWindow = hybridViewerStore.genericRenderWindow.value as unknown as
      | RenderWindowLike
      | undefined;
    const size = renderWindow?.getApiSpecificRenderWindow().getSize();
    if (size === undefined || size[0] === 0 || size[1] === 0) {
      return undefined;
    }
    return size;
  }

  // What the screen shows of the base, and the ground size of one of its pixels
  function currentView(grid: BasemapGrid, size: readonly number[]): CurrentView {
    // oxlint-disable-next-line no-unsafe-type-assertion -- camera_options carries the vtk.js camera fields
    const camera = hybridViewerStore.camera_options as unknown as ViewCamera;
    const planeZ = grid.z * hybridViewerStore.zScale;
    const aspect = (size[0] ?? 1) / (size[1] ?? 1);
    const visibleArea = visibleMapArea(camera, aspect, planeZ, grid.bounds);
    const wanted = screenPixelGroundSize(camera, size[1] ?? 1);
    return { visibleArea, wanted, sharperNeeded: needsSharperMap(mapResolution(grid), wanted) };
  }

  // The visible area at about one map pixel per screen pixel, without margin
  async function detailRequest(
    { maps, visibleArea, z }: Readonly<{ maps: MapStyle[]; visibleArea: MapBounds; z: number }>,
    size: readonly number[],
  ): Promise<BasemapBuildResponse | undefined> {
    const crs = crsStore.projectCrs;
    if (crs === undefined) {
      return undefined;
    }
    const response = await backStore.request({
      schema: back_schemas.opengeodeweb_back.basemap.build,
      params: {
        maps: [...maps],
        crs,
        bounds: visibleArea,
        z,
        margin: false,
        max_pixels: Math.min(MAX_DETAIL_PIXELS, Math.max(...size)),
      },
    });
    return response;
  }

  return { viewportSize, currentView, detailRequest };
}

export { useDetailView };
