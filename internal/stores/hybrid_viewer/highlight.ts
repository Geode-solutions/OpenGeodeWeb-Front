import { HOVER_DEBOUNCE_MS, HOVER_TIMEOUT_MS } from "./constants";
import type { HoverComponentInfo, HoverData } from "./vtk_types";
import type { IndexableType } from "dexie";
import { database } from "@ogw_internal/database/database.js";
import { useHybridViewerCore } from "./core";
import { useHybridViewerScene } from "./scene";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// The dynamic/RPC-shaped payload of the viewer's "highlight" schema response.
interface HighlightResponse {
  id?: string;
  picked_id?: number;
  field_type?: string;
  geode_id?: string | null;
  attributes?: Record<string, unknown>;
}

// Shared via createSharedComposable (rather than merged into the parent hybridViewer store) so sibling slices, e.g. ruler.ts and viewport.ts, can read hover state/clearHoverHighlight/hoverHighlight directly without importing the parent store and creating a cycle. A Pinia store would work too but its $id/$patch/... properties would leak into the composed store's spread and collapse its inferred type.
const useHybridViewerHighlight = createSharedComposable(() => {
  const is_hover_highlight = ref(false);
  const hover_highlight_field_type = ref("CELL");
  const hoverData = ref<HoverData | undefined>(undefined);
  const hoverPosition = ref({
    x: 0,
    y: 0,
  });
  const hoverTimeoutRef = ref<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentHoverId = ref<string | undefined>(undefined);

  function clearHoverData(): void {
    if (hoverTimeoutRef.value) {
      clearTimeout(hoverTimeoutRef.value);
      hoverTimeoutRef.value = undefined;
    }
    hoverData.value = undefined;
    currentHoverId.value = undefined;
  }

  function requestHoverHighlight(
    event: MouseEvent,
    onResponse: (response: unknown) => void | Promise<void>,
  ): void {
    if (!is_hover_highlight.value) {
      return;
    }
    const { genericRenderWindow } = useHybridViewerCore();
    const { hybridDb } = useHybridViewerScene();
    const container = genericRenderWindow.value?.getContainer();
    if (!container) {
      return;
    }
    const viewerStore = useViewerStore();
    const rect = container.getBoundingClientRect();
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.highlight;
    const params = {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(rect.height - (event.clientY - rect.top)),
      field_type: hover_highlight_field_type.value,
      ids: Object.keys(hybridDb),
    };
    viewerStore
      .request(
        {
          schema,
          params,
        },
        {
          response_function: onResponse,
        },
      )
      // oxlint-disable-next-line promise/prefer-await-to-then -- fire-and-forget inside a sync caller; see codebase convention in global_attribute_style.ts.
      .catch(() => undefined);
  }

  const hoverHighlight = useDebounceFn((event: MouseEvent) => {
    const { genericRenderWindow } = useHybridViewerCore();
    const containerElement = genericRenderWindow.value?.getContainer();
    const relativeMousePosition = containerElement
      ? {
          x: event.clientX - containerElement.getBoundingClientRect().left,
          y: event.clientY - containerElement.getBoundingClientRect().top,
        }
      : {
          x: event.clientX,
          y: event.clientY,
        };
    requestHoverHighlight(event, async (rawResponse: unknown) => {
      // oxlint-disable-next-line no-unsafe-type-assertion -- trusted viewer RPC response boundary.
      const response = rawResponse as HighlightResponse | undefined;
      if (
        !is_hover_highlight.value ||
        response === undefined ||
        response.id === undefined ||
        response.picked_id === undefined ||
        response.picked_id === -1
      ) {
        clearHoverData();
        return;
      }
      const hoverKey = `${response.id}_${response.field_type}_${response.picked_id}`;
      if (currentHoverId.value === hoverKey) {
        return;
      }
      if (hoverTimeoutRef.value) {
        clearTimeout(hoverTimeoutRef.value);
        hoverTimeoutRef.value = undefined;
      }
      hoverData.value = undefined;
      currentHoverId.value = hoverKey;
      let componentInfo: HoverComponentInfo | undefined = undefined;
      let modelName: string | undefined = undefined;
      const modelRecord = (await database.data?.get(response.id)) as { name?: string } | undefined;
      if (modelRecord) {
        modelName = modelRecord.name;
      }
      const modelComponentsTable = database.model_components;
      if (response.geode_id !== undefined && response.geode_id !== null && modelComponentsTable) {
        const components = modelComponentsTable.where("[id+geode_id]");
        const query = components.equals([response.id, response.geode_id] as IndexableType);
        const component = (await query.first()) as
          | { name?: string; geode_id?: string; type?: string }
          | undefined;
        if (component) {
          componentInfo = {
            name: component.name ?? "",
            id: component.geode_id ?? "",
            type: component.type ?? "",
          };
        }
      }
      const newHoverData: HoverData = {
        modelId: response.id,
        modelName,
        blockName: response.geode_id ?? undefined,
        pickedId: response.picked_id,
        fieldType: response.field_type,
        component: componentInfo,
        attributes: response.attributes ?? {},
      };
      hoverTimeoutRef.value = setTimeout(() => {
        hoverPosition.value = relativeMousePosition;
        hoverData.value = newHoverData;
        hoverTimeoutRef.value = undefined;
      }, HOVER_TIMEOUT_MS);
    });
  }, HOVER_DEBOUNCE_MS);

  function requestClearHoverHighlight(): void {
    const { hybridDb } = useHybridViewerScene();
    const viewerStore = useViewerStore();
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.highlight;
    const params = {
      x: -1,
      y: -1,
      field_type: hover_highlight_field_type.value,
      ids: Object.keys(hybridDb),
    };
    viewerStore
      .request({
        schema,
        params,
      })
      // oxlint-disable-next-line promise/prefer-await-to-then -- fire-and-forget inside a sync caller; see codebase convention in global_attribute_style.ts.
      .catch(() => undefined);
  }

  function clearHoverHighlight(): void {
    clearHoverData();
    requestClearHoverHighlight();
  }

  return {
    is_hover_highlight,
    hover_highlight_field_type,
    hoverData,
    hoverPosition,
    clearHoverHighlight,
    hoverHighlight,
  };
});

export { useHybridViewerHighlight };
