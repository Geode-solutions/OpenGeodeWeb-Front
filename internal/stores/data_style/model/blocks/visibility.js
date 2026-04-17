import { useDataStore } from "@ogw_front/stores/data";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.visibility;

export function useModelBlocksVisibility() {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const modelCommonStyle = useModelCommonStyle();

  function setModelBlocksVisibility(modelId, componentIds, visibility) {
    return modelCommonStyle.setModelTypeVisibility(modelId, componentIds, visibility, schema, {
      dataStore,
      viewerStore,
    });
  }

  return { setModelBlocksVisibility };
}
