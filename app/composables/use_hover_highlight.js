import { useViewerStore } from "@ogw_front/stores/viewer";
import vtk_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const HOVER_DELAY = 2000;

export function useHoverHighlight() {
  const viewerStore = useViewerStore();
  const highlight_schema = vtk_schemas.opengeodeweb_viewer.model.highlight.highlight;
  let timer = undefined;
  let currentId = undefined;

  function onHoverEnter(id, block_ids) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(async () => {
      currentId = id;
      await viewerStore.request(highlight_schema, {
        id,
        block_ids,
      });
    }, HOVER_DELAY);
  }

  function onHoverLeave(id) {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (currentId === id) {
      viewerStore.request(highlight_schema, {
        id,
        block_ids: [],
      });
      currentId = undefined;
    }
  }

  return { onHoverEnter, onHoverLeave };
}
