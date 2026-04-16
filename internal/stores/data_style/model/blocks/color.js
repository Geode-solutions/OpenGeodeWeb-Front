// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks;

export function useModelBlocksColorStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const dataStyleState = useDataStyleState();

  function modelBlockColor(id, block_id) {
    return modelBlocksCommonStyle.modelBlockStyle(id, block_id).color;
  }

  function setModelBlocksColor(id, block_ids, color, color_mode = "constant") {
    return dataStyleState
      .setModelTypeColor(id, block_ids, color, color_mode, model_blocks_schemas.color, {
        dataStore,
        viewerStore,
      })
      .then((res) => {
        if (!res) {
          return modelBlocksCommonStyle.mutateModelBlocksStyle(id, block_ids, {
            color,
            color_mode,
          });
        }
        return res;
      });
  }

  return { modelBlockColor, setModelBlocksColor };
}
