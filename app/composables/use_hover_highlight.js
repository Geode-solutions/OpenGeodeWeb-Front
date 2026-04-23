import { useViewerStore } from "@ogw_front/stores/viewer";
import vtk_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const HOVER_DELAY = 1000;

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
      const params = {
        id,
        visibility: true,
        ...(type === "model" ? { block_ids } : {}),
      };
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
      const params = {
        id,
        visibility: false,
        ...(currentType === "model" ? { block_ids: [] } : {}),
      };
      viewerStore.request(schema, params);
      currentId = undefined;
      currentType = undefined;
    }
  }

  return { onHoverEnter, onHoverLeave };
}
