import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSurfacesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.visibility;

export function useModelSurfacesVisibility() {
  const modelCommonStyle = useModelCommonStyle();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();

  function modelSurfaceVisibility(id: string, surface_id?: string): unknown {
    return modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).visibility;
  }

  function setModelSurfacesVisibility(
    modelId: string,
    surfaces_ids: string[],
    visibility: boolean | undefined,
  ) {
    return modelCommonStyle.setModelTypeVisibility(modelId, surfaces_ids, visibility, schema);
  }

  return { setModelSurfacesVisibility, modelSurfaceVisibility };
}
