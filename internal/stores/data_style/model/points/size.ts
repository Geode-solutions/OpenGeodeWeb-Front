// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useModelPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.points.size;

export function useModelPointsSizeStyle(): {
  modelPointsSize: (id: string) => number | undefined;
  setModelPointsSize: (id: string, size: number | undefined) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const modelPointsCommonStyle = useModelPointsCommonStyle();

  function modelPointsSize(id: string): number | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- points style values are dynamically typed at runtime.
    return modelPointsCommonStyle.modelPointsStyle(id).size as number | undefined;
  }

  async function setModelPointsSize(id: string, size: number | undefined): Promise<unknown> {
    const params = { id, size };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const mutateResult = await modelPointsCommonStyle.mutateModelPointsStyle(id, { size });
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    modelPointsSize,
    setModelPointsSize,
  };
}
