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

      // Sécurité : on force les entiers pour le backend
      block_ids = (Array.isArray(block_ids) ? block_ids : [])
        .map((id) => Number.parseInt(id, 10))
        .filter((id) => !Number.isNaN(id));

      // Sécurité : on vérifie que l'utilisateur est toujours sur le MÊME objet après l'éventuel await
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
    // On reset l'ID même si ce n'était pas le currentId pour éviter les ghost highlights
    if (!currentId) {
      currentId = undefined;
      currentType = undefined;
    }
  }

  return { onHoverEnter, onHoverLeave };
}
