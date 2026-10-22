// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

import {
  EDGES_COMPONENT_TYPES,
  useModelComponentEdgesStyle,
} from "@ogw_internal/stores/data_style/model/edges/component";
import { useModelEdgesCommonStyle } from "./common";
import { useModelEdgesWidthStyle } from "./width";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { whenDefined } from "@ogw_internal/stores/data_style/when_defined";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.edges.visibility;

interface ModelEdgesVisibilityStyleApi {
  modelEdgesVisibility: (id: string) => boolean | undefined;
  setModelEdgesVisibility: (id: string, visibility: boolean) => Promise<unknown>;
  applyModelEdgesStyle: (id: string) => Promise<unknown[]>;
}

export function useModelEdgesVisibilityStyle(): ModelEdgesVisibilityStyleApi {
  const viewerStore = useViewerStore();
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();
  const modelEdgesWidthStyle = useModelEdgesWidthStyle();
  const componentsEdgesStyles = EDGES_COMPONENT_TYPES.map((type) =>
    useModelComponentEdgesStyle(type),
  );

  function modelEdgesVisibility(id: string): boolean | undefined {
    const { visibility } = modelEdgesCommonStyle.modelEdgesStyle(id);
    if (typeof visibility === "boolean") {
      return visibility;
    }
    return undefined;
  }

  async function setModelEdgesVisibility(id: string, visibility: boolean): Promise<unknown> {
    const params = { id, visibility };
    const result = await viewerStore.request(
      { schema, params },
      {
        response_function: async () => {
          await Promise.all([
            modelEdgesCommonStyle.mutateModelEdgesStyle(id, { visibility }),
            ...componentsEdgesStyles.map(async (edgesStyle) => {
              await edgesStyle.mutateStyledEdges(id, { visibility });
            }),
          ]);
        },
      },
    );
    return result;
  }

  async function applyModelEdgesStyle(id: string): Promise<unknown[]> {
    const visibilityResult = await whenDefined(modelEdgesVisibility(id), async (visibility) => {
      const applied = await setModelEdgesVisibility(id, visibility);
      return applied;
    });
    const widthResult = await whenDefined(
      modelEdgesWidthStyle.modelEdgesWidth(id),
      async (width) => {
        const applied = await modelEdgesWidthStyle.setModelEdgesWidth(id, width);
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
