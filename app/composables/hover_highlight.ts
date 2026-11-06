import type { DataId } from "@ogw_front/types/identifiers";
import type { ParamsOf } from "@ogw_shared/utils/types";
import { consola } from "consola";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import vtk_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const HOVER_DELAY = 200;

type HighlightType = "mesh" | "model";
type HighlightSchema = (typeof vtk_schemas)["opengeodeweb_viewer"][HighlightType]["highlight"];
type BlockIdsProvider = readonly number[] | (() => readonly number[] | Promise<readonly number[]>);

export function useHoverhighlight(): {
  onHoverEnter: typeof onHoverEnter;
  onHoverLeave: typeof onHoverLeave;
} {
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;
  // Item hovered last, whose highlight may still be pending
  let currentId: DataId | undefined = undefined;
  // Item the viewer was asked to highlight, the only one to unhighlight
  let highlighted: { dataId: DataId; type: HighlightType } | undefined = undefined;

  function onHoverEnter(
    dataId: DataId,
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
      currentId = dataId;

      if (!(await dataStore.isItemViewable(dataId))) {
        return;
      }

      let block_ids: number[] = [];
      if (typeof block_ids_provider === "function") {
        block_ids = [...(await block_ids_provider())];
      } else {
        block_ids = [...block_ids_provider];
      }

      block_ids = (Array.isArray(block_ids) ? block_ids : [])
        .map((blockId) => Math.trunc(blockId))
        .filter((blockId) => !Number.isNaN(blockId));

      if (currentId !== dataId) {
        return;
      }

      highlighted = { dataId, type };
      const params = {
        id: dataId,
        visibility: true,
        ...(type === "model" && { block_ids }),
      };
      try {
        await viewerStore.request({ schema, params });
      } catch (error) {
        consola.error(`Highlight failed for ${type} ${dataId}:`, error);
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
    dataId: DataId,
    request: {
      schema: HighlightSchema;
      params?: ParamsOf<HighlightSchema>;
      timeout?: number;
    },
  ): Promise<void> {
    try {
      await viewerStore.request(request);
    } catch (error) {
      consola.error(`Unhighlight failed for ${type} ${dataId}:`, error);
    }
  }

  function onHoverLeave(dataId: DataId): void {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (currentId === dataId) {
      currentId = undefined;
    }
    if (highlighted?.dataId === dataId) {
      const { type } = highlighted;
      const schema = vtk_schemas.opengeodeweb_viewer[type].highlight;
      const params = {
        id: dataId,
        visibility: false,
        ...(type === "model" && { block_ids: [] }),
      };
      // oxlint-disable-next-line typescript/no-floating-promises -- unhighlightAction catches its own errors internally.
      unhighlightAction(type, dataId, { schema, params });
      highlighted = undefined;
    }
  }

  return { onHoverEnter, onHoverLeave };
}
