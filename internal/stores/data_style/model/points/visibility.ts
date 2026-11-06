// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  POINTS_COMPONENT_TYPES,
  useModelComponentPointsStyle,
} from "@ogw_internal/stores/data_style/model/points/component";
import type { ModelId } from "@ogw_front/types/identifiers";
import { useModelPointsCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.points.visibility;

export function useModelPointsVisibilityStyle(): {
  modelPointsVisibility: (modelId: ModelId) => boolean | undefined;
  setModelPointsVisibility: (modelId: ModelId, visibility: boolean) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const modelPointsCommonStyle = useModelPointsCommonStyle();
  const componentsPointsStyles = POINTS_COMPONENT_TYPES.map((type) =>
    useModelComponentPointsStyle(type),
  );

  function modelPointsVisibility(modelId: ModelId): boolean | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- points style values are dynamically typed at runtime.
    return modelPointsCommonStyle.modelPointsStyle(modelId).visibility as boolean | undefined;
  }

  async function setModelPointsVisibility(modelId: ModelId, visibility: boolean): Promise<unknown> {
    const params = { id: modelId, visibility };
    const result = await viewerStore.request(
      { schema, params },
      {
        response_function: async () => {
          const [mutateResult] = await Promise.all([
            modelPointsCommonStyle.mutateModelPointsStyle(modelId, { visibility }),
            ...componentsPointsStyles.map(async (pointsStyle) => {
              await pointsStyle.mutateStyledPoints(modelId, { visibility });
            }),
          ]);
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
