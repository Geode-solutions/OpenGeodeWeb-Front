// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  EDGES_COMPONENT_TYPES,
  useModelComponentEdgesStyle,
} from "@ogw_internal/stores/data_style/model/edges/component";
import { useModelEdgesCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const schema = viewer_schemas.opengeodeweb_viewer.model.edges.width;

export function useModelEdgesWidthStyle(): {
  modelEdgesWidth: (id: string) => number | undefined;
  setModelEdgesWidth: (id: string, width: number) => Promise<unknown>;
} {
  const viewerStore = useViewerStore();
  const modelEdgesCommonStyle = useModelEdgesCommonStyle();
  const componentsEdgesStyles = EDGES_COMPONENT_TYPES.map((type) =>
    useModelComponentEdgesStyle(type),
  );

  function modelEdgesWidth(id: string): number | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- edges style values are dynamically typed at runtime.
    return modelEdgesCommonStyle.modelEdgesStyle(id).width as number | undefined;
  }

  async function setModelEdgesWidth(id: string, width: number): Promise<unknown> {
    const params = { id, width };
    const result = await viewerStore.request(
      {
        schema,
        params,
      },
      {
        response_function: async () => {
          const [mutateResult] = await Promise.all([
            modelEdgesCommonStyle.mutateModelEdgesStyle(id, { width }),
            ...componentsEdgesStyles.map(async (edgesStyle) => {
              await edgesStyle.mutateStyledEdges(id, { width });
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
