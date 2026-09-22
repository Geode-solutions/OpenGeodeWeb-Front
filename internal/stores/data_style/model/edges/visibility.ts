// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { useModelEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.edges.visibility;

interface ModelEdgesVisibilityStyleApi {
  modelEdgesVisibility: (id: string) => boolean | undefined;
  setModelEdgesVisibility: (id: string, visibility: boolean | undefined) => Promise<unknown>;
  applyModelEdgesStyle: (id: string) => Promise<unknown[]>;
}

export function useModelEdgesVisibilityStyle(): ModelEdgesVisibilityStyleApi {
  const viewerStore = useViewerStore();
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();

  function modelEdgesVisibility(id: string): boolean | undefined {
    const { visibility } = modelEdgesCommonStyle.modelEdgesStyle(id);
    if (typeof visibility === "boolean") {
      return visibility;
    }
    return undefined;
  }

  async function setModelEdgesVisibility(
    id: string,
    visibility: boolean | undefined,
  ): Promise<unknown> {
    const params = { id, visibility };
    const result = await viewerStore.request(
      { schema, params },
      {
        response_function: async () => {
          await modelEdgesCommonStyle.mutateModelEdgesStyle(id, { visibility });
        },
      },
    );
    return result;
  }

  async function applyModelEdgesStyle(id: string): Promise<unknown[]> {
    const visibility = modelEdgesVisibility(id);
    const result = await setModelEdgesVisibility(id, visibility);
    return [result];
  }

  return {
    modelEdgesVisibility,
    setModelEdgesVisibility,
    applyModelEdgesStyle,
  };
}
