import { useViewerStore } from "@ogw_front/stores/viewer";
import vtk_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const HOVER_DELAY = 600;

export function useHoverhighlight() {
  const viewerStore = useViewerStore();
  let timer = undefined;
  let currentId = undefined;
  let currentType = undefined;

  function onHoverEnter(id, block_ids, type = "model") {
    if (timer) {
      clearTimeout(timer);
    }
    const schema = vtk_schemas.opengeodeweb_viewer[type].highlight;
    timer = setTimeout(async () => {
      currentId = id;
      currentType = type;
      await viewerStore.request(schema, {
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
      const schema = vtk_schemas.opengeodeweb_viewer[currentType].highlight;
      viewerStore.request(schema, {
        id,
        block_ids: [],
      });
      currentId = undefined;
      currentType = undefined;
    }
  }

  return { onHoverEnter, onHoverLeave };
}
