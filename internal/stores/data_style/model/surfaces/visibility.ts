import type { DataId, ModelComponentId } from "@ogw_front/types/identifiers";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSurfacesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.visibility;

export function useModelSurfacesVisibility(): {
  setModelSurfacesVisibility: (
    modelId: DataId,
    surfaces_ids: readonly ModelComponentId[],
    visibility: boolean,
  ) => Promise<unknown>;
  modelSurfaceVisibility: (modelId: DataId, surface_id?: ModelComponentId) => unknown;
} {
  const modelCommonStyle = useModelCommonStyle();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();

  function modelSurfaceVisibility(modelId: DataId, surface_id?: ModelComponentId): unknown {
    return modelSurfacesCommonStyle.modelSurfaceStyle(modelId, surface_id).visibility;
  }

  async function setModelSurfacesVisibility(
    modelId: DataId,
    surfaces_ids: readonly ModelComponentId[],
    visibility: boolean,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeVisibility(
      modelId,
      [...surfaces_ids],
      visibility,
      schema,
    );
    return result;
  }

  return { setModelSurfacesVisibility, modelSurfaceVisibility };
}
