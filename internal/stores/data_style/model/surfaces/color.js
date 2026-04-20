import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSurfacesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.color;

export function useModelSurfacesColor() {
  const modelCommonStyle = useModelCommonStyle();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();

  function modelSurfaceColor(id, surface_id) {
    return modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).color;
  }

  function setModelSurfacesColor(modelId, surfaces_ids, color, color_mode = "constant") {
    return modelCommonStyle.setModelTypeColor(modelId, surfaces_ids, color, schema, color_mode);
  }

  return { setModelSurfacesColor, modelSurfaceColor };
}
