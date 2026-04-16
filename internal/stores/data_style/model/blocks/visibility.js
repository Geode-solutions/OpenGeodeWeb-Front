// Third party imports
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// Local imports
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelBlocksCommonStyle } from "./common";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const model_blocks_schemas = viewer_schemas.opengeodeweb_viewer.model.blocks;

export function useModelBlocksVisibilityStyle() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const dataStyleState = useDataStyleState();

  function modelBlockVisibility(id, block_id) {
    const style = modelBlocksCommonStyle.modelBlockStyle(id, block_id);
    return style.visibility ?? true;
  }

  function setModelBlocksVisibility(id, block_ids, visibility) {
    return dataStyleState
      .setModelTypeVisibility(id, block_ids, visibility, model_blocks_schemas.visibility, {
        dataStore,
        viewerStore,
      })
      .then((res) => {
        if (!res) {
          return modelBlocksCommonStyle.mutateModelBlocksStyle(id, block_ids, {
            visibility,
          });
        }
        return res;
      });
  }

  return {
    modelBlockVisibility,
    setModelBlocksVisibility,
  };
}
