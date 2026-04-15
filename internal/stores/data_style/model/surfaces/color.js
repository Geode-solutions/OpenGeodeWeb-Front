// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces;

export function useModelSurfacesColorStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();

  function modelSurfaceColor(id, surface_id) {
    return modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).color;
  }

  function setModelSurfacesColor(id, surface_ids, color, color_mode = "constant") {
    if (!surface_ids || surface_ids.length === 0) {
      return Promise.resolve();
    }
    return dataStore.getMeshComponentsViewerIds(id, surface_ids).then((surface_viewer_ids) => {
      if (!surface_viewer_ids || surface_viewer_ids.length === 0) {
        return modelSurfacesCommonStyle.mutateModelSurfacesStyle(id, surface_ids, {
          color,
          color_mode,
        });
      }
      const params = { id, block_ids: surface_viewer_ids, color_mode };
      if (color_mode === "constant") {
        params.color = color;
      }
      return viewerStore.request(model_surfaces_schemas.color, params);
    });
  }

  return { modelSurfaceColor, setModelSurfacesColor };
}
