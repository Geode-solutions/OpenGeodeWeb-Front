// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import {
  EDGES_COMPONENT_TYPES,
  useModelComponentEdgesStyle,
} from "@ogw_internal/stores/data_style/model/edges/component";
import type { ModelId } from "@ogw_front/types/identifiers";
import type { Visibility } from "@ogw_front/types/style";
import { useModelEdgesCommonStyle } from "./common";
import { useModelEdgesWidthStyle } from "./width";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.edges.visibility;

interface ModelEdgesVisibilityStyleApi {
  modelEdgesVisibility: (modelId: ModelId) => Visibility | undefined;
  setModelEdgesVisibility: (modelId: ModelId, visibility: Visibility) => Promise<unknown>;
  applyModelEdgesStyle: (modelId: ModelId) => Promise<unknown[]>;
}

export function useModelEdgesVisibilityStyle(): ModelEdgesVisibilityStyleApi {
  const viewerStore = useViewerStore();
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();
  const modelEdgesWidthStyle = useModelEdgesWidthStyle();
  const componentsEdgesStyles = EDGES_COMPONENT_TYPES.map((type) =>
    useModelComponentEdgesStyle(type),
  );

  function modelEdgesVisibility(modelId: ModelId): Visibility | undefined {
    const { visibility } = modelEdgesCommonStyle.modelEdgesStyle(modelId);
    if (typeof visibility === "boolean") {
      return visibility;
    }
    return undefined;
  }

  async function setModelEdgesVisibility(
    modelId: ModelId,
    visibility: Visibility,
  ): Promise<unknown> {
    const params = { id: modelId, visibility };
    const result = await viewerStore.request(
      { schema, params },
      {
        response_function: async () => {
          await Promise.all([
            modelEdgesCommonStyle.mutateModelEdgesStyle(modelId, { visibility }),
            ...componentsEdgesStyles.map(async (edgesStyle) => {
              await edgesStyle.mutateStyledEdges(modelId, { visibility });
            }),
          ]);
        },
      },
    );
    return result;
  }

  async function applyModelEdgesStyle(modelId: ModelId): Promise<unknown[]> {
    const visibilityResult = await whenDefined(
      modelEdgesVisibility(modelId),
      async (visibility) => {
        const applied = await setModelEdgesVisibility(modelId, visibility);
        return applied;
      },
    );
    const widthResult = await whenDefined(
      modelEdgesWidthStyle.modelEdgesWidth(modelId),
      async (width) => {
        const applied = await modelEdgesWidthStyle.setModelEdgesWidth(modelId, width);
        return applied;
      },
    );
    return [visibilityResult, widthResult];
  }

  return {
    modelEdgesVisibility,
    setModelEdgesVisibility,
    applyModelEdgesStyle,
  };
}
