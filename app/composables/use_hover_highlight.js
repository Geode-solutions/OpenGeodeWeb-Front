import { useViewerStore } from "@ogw_front/stores/viewer";
import vtk_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const HOVER_DELAY = 200;

export function useHoverhighlight() {
  const viewerStore = useViewerStore();
  let timer = undefined;
  let currentId = undefined;
  let currentType = undefined;

  function onHoverEnter(id, block_ids_provider = [], type = "model") {
    if (timer) {
      clearTimeout(timer);
    }
    const schema = vtk_schemas.opengeodeweb_viewer[type].highlight;
    timer = setTimeout(async () => {
      currentId = id;
      currentType = type;

      let block_ids = [];
      if (typeof block_ids_provider === "function") {
        block_ids = await block_ids_provider();
      } else {
        block_ids = block_ids_provider;
      }

      block_ids = (Array.isArray(block_ids) ? block_ids : [])
        .map((blockId) => Number.parseInt(blockId, 10))
        .filter((blockId) => !Number.isNaN(blockId));

      if (currentId !== id) {
        return;
      }

      const params = {
        id,
        visibility: true,
        ...(type === "model" && { block_ids }),
      };
      try {
        await viewerStore.request(schema, params);
      } catch (error) {
        console.error(`Highlight failed for ${type} ${id}:`, error);
      }
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
        ...(currentType === "model" && { block_ids: [] }),
      };
      try {
        viewerStore.request(schema, params);
      } catch (error) {
        console.error(`Unhighlight failed for ${currentType} ${id}:`, error);
      }
      currentId = undefined;
      currentType = undefined;
    }

    if (!currentId) {
      currentId = undefined;
      currentType = undefined;
    }
  }

  return { onHoverEnter, onHoverLeave };
}
