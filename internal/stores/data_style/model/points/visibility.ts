// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useModelPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.points.visibility;

export function useModelPointsVisibilityStyle(): {
  modelPointsVisibility: (id: string) => boolean | undefined;
  setModelPointsVisibility: (id: string, visibility: boolean | undefined) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const modelPointsCommonStyle = useModelPointsCommonStyle();

  function modelPointsVisibility(id: string): boolean | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- points style values are dynamically typed at runtime.
    return modelPointsCommonStyle.modelPointsStyle(id).visibility as boolean | undefined;
  }

  async function setModelPointsVisibility(
    id: string,
    visibility: boolean | undefined,
  ): Promise<unknown> {
    const params = { id, visibility };
    const result = await viewerStore.request(
      { schema, params },
      {
        response_function: async () => {
          const mutateResult = await modelPointsCommonStyle.mutateModelPointsStyle(id, {
            visibility,
          });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    modelPointsVisibility,
    setModelPointsVisibility,
  };
}
