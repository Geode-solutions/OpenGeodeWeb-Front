import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSurfacesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.visibility;

export function useModelSurfacesVisibility(): {
  setModelSurfacesVisibility: (
    modelId: string,
    surfaces_ids: readonly string[],
    visibility: boolean | undefined,
  ) => Promise<unknown>;
  modelSurfaceVisibility: (id: string, surface_id?: string) => unknown;
} {
  const modelCommonStyle = useModelCommonStyle();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();

  function modelSurfaceVisibility(id: string, surface_id?: string): unknown {
    return modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).visibility;
  }

  async function setModelSurfacesVisibility(
    modelId: string,
    surfaces_ids: readonly string[],
    visibility: boolean | undefined,
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
