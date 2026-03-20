// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks;

export function useModelBlocksColorStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();

  function modelBlockColor(id, block_id) {
    return modelBlocksCommonStyle.modelBlockStyle(id, block_id).color;
  }

  function setModelBlocksColor(id, block_ids, color) {
    if (!block_ids || block_ids.length === 0) {
      return Promise.resolve();
    }
    return dataStore.getMeshComponentsViewerIds(id, block_ids).then((block_viewer_ids) => {
      if (!block_viewer_ids || block_viewer_ids.length === 0) {
        console.warn("[setModelBlocksColor] No viewer IDs found, skipping color request", {
          id,
          block_ids,
        });
        return modelBlocksCommonStyle.mutateModelBlocksStyle(id, block_ids, {
          color,
        });
      }
      return viewerStore.request(
        model_blocks_schemas.color,
        { id, block_ids: block_viewer_ids, color },
        {
          response_function: () => {
            return modelBlocksCommonStyle.mutateModelBlocksStyle(id, block_ids, { color });
          },
        },
      );
    });
  }

  return {
    modelBlockColor,
    setModelBlocksColor,
  };
}
