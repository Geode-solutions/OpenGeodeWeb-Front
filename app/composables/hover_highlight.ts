import type { JsonRpcSchema } from "@ogw_shared/utils/types";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import vtk_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const HOVER_DELAY = 200;

type HighlightType = "mesh" | "model";
type BlockIdsProvider = readonly number[] | (() => readonly number[] | Promise<readonly number[]>);

export function useHoverhighlight(): {
  onHoverEnter: typeof onHoverEnter;
  onHoverLeave: typeof onHoverLeave;
} {
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

    async function highlightAction(): Promise<void> {
      currentId = id;
      currentType = type;

      if (!(await dataStore.isItemViewable(id))) {
        return;
      }

      let block_ids: number[] = [
        ...(typeof block_ids_provider === "function"
          ? await block_ids_provider()
          : block_ids_provider),
      ];

      block_ids = (Array.isArray(block_ids) ? block_ids : [])
        .map((blockId) => Math.trunc(blockId))
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

    async function runHighlightAction(): Promise<void> {
      try {
        await highlightAction();
      } catch {
        // Ignore
      }
    }

    if (immediate) {
      // oxlint-disable-next-line typescript/no-floating-promises -- runHighlightAction catches its own errors internally.
      runHighlightAction();
    } else {
      timer = setTimeout(() => {
        // oxlint-disable-next-line typescript/no-floating-promises -- runHighlightAction catches its own errors internally.
        runHighlightAction();
      }, HOVER_DELAY);
    }
  }

  async function unhighlightAction(
    type: HighlightType,
    id: string,
    request: {
      schema: JsonRpcSchema;
      params?: Record<string, unknown>;
      timeout?: number;
    },
  ): Promise<void> {
    try {
      await viewerStore.request(request);
    } catch (error) {
      console.error(`Unhighlight failed for ${type} ${id}:`, error);
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
      // oxlint-disable-next-line typescript/no-floating-promises -- unhighlightAction catches its own errors internally.
      unhighlightAction(currentType, id, { schema, params });
      currentId = undefined;
      currentType = undefined;
    }

    if (currentId === undefined) {
      currentId = undefined;
      currentType = undefined;
    }
  }

  return { onHoverEnter, onHoverLeave };
}
