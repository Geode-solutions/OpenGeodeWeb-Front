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

  function setModelSurfacesColor(id, surface_ids, color) {
    if (!surface_ids || surface_ids.length === 0) {
      return Promise.resolve();
    }
    return dataStore.getMeshComponentsViewerIds(id, surface_ids).then((surface_viewer_ids) => {
      if (!surface_viewer_ids || surface_viewer_ids.length === 0) {

        return modelSurfacesCommonStyle.mutateModelSurfacesStyle(id, surface_ids, { color });
      }
      return viewerStore.request(
        model_surfaces_schemas.color,
        { id, block_ids: surface_viewer_ids, color },
        {
          response_function: () =>
            modelSurfacesCommonStyle.mutateModelSurfacesStyle(id, surface_ids, { color }),
        },
      );
    });
  }

  return {
    modelSurfaceColor,
    setModelSurfacesColor,
  };
}
