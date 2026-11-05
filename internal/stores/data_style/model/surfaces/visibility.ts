import type { DataId } from "@ogw_front/types/identifiers";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSurfacesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.visibility;

export function useModelSurfacesVisibility(): {
  setModelSurfacesVisibility: (
    modelId: DataId,
    surfaces_ids: readonly string[],
    visibility: boolean,
  ) => Promise<unknown>;
  modelSurfaceVisibility: (modelId: DataId, surface_id?: string) => unknown;
} {
  const modelCommonStyle = useModelCommonStyle();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();

  function modelSurfaceVisibility(modelId: DataId, surface_id?: string): unknown {
    return modelSurfacesCommonStyle.modelSurfaceStyle(modelId, surface_id).visibility;
  }

  async function setModelSurfacesVisibility(
    modelId: DataId,
    surfaces_ids: readonly string[],
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
