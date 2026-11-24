import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { ParamsOf } from "@ogw_shared/utils/types";
import type { ViewerId } from "@geode/opengeodeweb-viewer/schema_types";
import type { ViewerObjectType } from "@geode/opengeodeweb-microservice/data_types";
import { consola } from "consola";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import vtk_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const HOVER_DELAY = 200;

type HighlightSchema = (typeof vtk_schemas)["opengeodeweb_viewer"][ViewerObjectType]["highlight"];
type BlockIdsProvider =
  | readonly ViewerId[]
  | (() => readonly ViewerId[] | Promise<readonly ViewerId[]>);

// Every live instance, so a highlight can be released from outside the component that started it
const instances = new Set<(dataId: DataId) => void>();

// Releases the hover and the viewer highlight of a data, whichever component started them:
// The element under the cursor may be removed, and browsers send no mouseleave for it
function releaseHoverHighlight(dataId: DataId): void {
  for (const release of instances) {
    release(dataId);
  }
}

function useHoverhighlight(): {
  onHoverEnter: typeof onHoverEnter;
  onHoverLeave: typeof onHoverLeave;
} {
  const viewerStore = useViewerStore();
  const dataStore = useDataStore();
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;
  // Item whose highlight is waiting for the delay
  let pendingId: DataId | undefined = undefined;
  // Item hovered last, whose highlight may still be pending
  let currentId: DataId | undefined = undefined;
  // Item the viewer was asked to highlight, the only one to unhighlight
  let highlighted: { dataId: DataId; type: ViewerObjectType } | undefined = undefined;

  function onHoverEnter(
    dataId: DataId,
    block_ids_provider: BlockIdsProvider = [],
    type: ViewerObjectType = "model",
    immediate = false,
  ): void {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    pendingId = dataId;
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
      pendingId = undefined;
      // oxlint-disable-next-line typescript/no-floating-promises -- runHighlightAction catches its own errors internally.
      runHighlightAction();
    } else {
      timer = setTimeout(() => {
        pendingId = undefined;
        // oxlint-disable-next-line typescript/no-floating-promises -- runHighlightAction catches its own errors internally.
        runHighlightAction();
      }, HOVER_DELAY);
    }
  }

  async function unhighlightAction(
    type: ViewerObjectType,
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
    if (pendingId === dataId) {
      pendingId = undefined;
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

  function release(dataId: DataId): void {
    if (pendingId === dataId || currentId === dataId || highlighted?.dataId === dataId) {
      onHoverLeave(dataId);
    }
  }

  // A component unmounted while hovered gets no mouseleave either
  if (getCurrentScope()) {
    instances.add(release);
    onScopeDispose(() => {
      instances.delete(release);
      for (const dataId of new Set([pendingId, currentId, highlighted?.dataId])) {
        if (dataId !== undefined) {
          onHoverLeave(dataId);
        }
      }
    });
  }

  return { onHoverEnter, onHoverLeave };
}

export { releaseHoverHighlight, useHoverhighlight };
