import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import vtk_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const HOVER_DELAY = 200;

type HighlightType = "mesh" | "model";
type BlockIdsProvider = number[] | (() => number[] | Promise<number[]>);

export function useHoverhighlight() {
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;
  let currentId: string | undefined = undefined;
  let currentType: HighlightType | undefined = undefined;

  function onHoverEnter(
    id: string,
    block_ids_provider: BlockIdsProvider = [],
    type: HighlightType = "model",
    immediate = false,
  ): void {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    const schema = vtk_schemas.opengeodeweb_viewer[type].highlight;

    async function highlightAction() {
      currentId = id;
      currentType = type;

      if (!(await dataStore.isItemViewable(id))) {
        return;
      }

      let block_ids: number[] =
        typeof block_ids_provider === "function" ? await block_ids_provider() : block_ids_provider;

      block_ids = (Array.isArray(block_ids) ? block_ids : [])
        .map((blockId) => Math.trunc(Number(blockId)))
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
        await viewerStore.request({ schema, params });
      } catch (error) {
        console.error(`Highlight failed for ${type} ${id}:`, error);
      }
    }

    if (immediate) {
      highlightAction();
    } else {
      timer = setTimeout(highlightAction, HOVER_DELAY);
    }
  }

  function onHoverLeave(id: string): void {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (currentId === id && currentType) {
      const schema = vtk_schemas.opengeodeweb_viewer[currentType].highlight;
      const params = {
        id,
        visibility: false,
        ...(currentType === "model" && { block_ids: [] }),
      };
      try {
        viewerStore.request({ schema, params });
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
