// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelSurfacesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_surfaces_schemas = viewer_schemas.opengeodeweb_viewer.model.surfaces;

export function useModelSurfacesColorStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const dataStyleState = useDataStyleState();

  function modelSurfaceColor(id, surface_id) {
    return modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).color;
  }

  function setModelSurfacesColor(id, surface_ids, color, color_mode = "constant") {
    return dataStyleState
      .setModelTypeColor(id, surface_ids, color, color_mode, model_surfaces_schemas.color, {
        dataStore,
        viewerStore,
      })
      .then((res) => {
        if (!res) {
          return modelSurfacesCommonStyle.mutateModelSurfacesStyle(id, surface_ids, {
            color,
            color_mode,
          });
        }
        return res;
      });
  }

  return { modelSurfaceColor, setModelSurfacesColor };
}
