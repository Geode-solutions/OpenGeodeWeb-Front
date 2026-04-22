import { useViewerStore } from "@ogw_front/stores/viewer";
import vtk_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const HOVER_DELAY = 800;

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
      const params =
        type === "model" ? { id, block_ids, visibility: true } : { id, visibility: true };
      await viewerStore.request(schema, params);
    }, HOVER_DELAY);
  }

  function onHoverLeave(id) {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (currentId === id) {
      const schema = vtk_schemas.opengeodeweb_viewer[currentType].highlight;
      const params =
        currentType === "model"
          ? { id, block_ids: [], visibility: false }
          : { id, visibility: false };
      viewerStore.request(schema, params);
      currentId = undefined;
      currentType = undefined;
    }
  }

  return { onHoverEnter, onHoverLeave };
}
