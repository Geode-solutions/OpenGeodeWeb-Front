// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  EDGES_COMPONENT_TYPES,
  useModelComponentEdgesStyle,
} from "@ogw_internal/stores/data_style/model/edges/component";
import type { ModelId } from "@ogw_front/types/identifiers";
import type { Width } from "@ogw_front/types/style";
import { useModelEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.edges.width;

export function useModelEdgesWidthStyle(): {
  modelEdgesWidth: (modelId: ModelId) => Width | undefined;
  setModelEdgesWidth: (modelId: ModelId, width: Width) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();
  const componentsEdgesStyles = EDGES_COMPONENT_TYPES.map((type) =>
    useModelComponentEdgesStyle(type),
  );

  function modelEdgesWidth(modelId: ModelId): Width | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- edges style values are dynamically typed at runtime.
    return modelEdgesCommonStyle.modelEdgesStyle(modelId).width as Width | undefined;
  }

  async function setModelEdgesWidth(modelId: ModelId, width: Width): Promise<unknown> {
    const params = { id: modelId, width };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const [mutateResult] = await Promise.all([
            modelEdgesCommonStyle.mutateModelEdgesStyle(modelId, { width }),
            ...componentsEdgesStyles.map(async (edgesStyle) => {
              await edgesStyle.mutateStyledEdges(modelId, { width });
            }),
          ]);
          return mutateResult;
        },
      },
    );
    return result;
  }

  return {
    modelEdgesWidth,
    setModelEdgesWidth,
  };
}
