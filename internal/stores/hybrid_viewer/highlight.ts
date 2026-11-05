import type { DataId, GeodeId, GeodeIdentified } from "@ogw_front/types/identifiers";
import { HOVER_DEBOUNCE_MS, HOVER_TIMEOUT_MS } from "./constants";
import type { HoverComponentInfo, HoverData } from "./vtk_types";
import viewer_schemas, {
  type PickedFieldType,
  type ViewerHighlightResponse,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import type { IndexableType } from "dexie";
import { database } from "@ogw_internal/database/database.js";
import { useHybridViewerCore } from "./core";
import { useHybridViewerScene } from "./scene";
import { useViewerStore } from "@ogw_front/stores/viewer";

async function lookupModelName(modelId: DataId): Promise<string | undefined> {
  const modelRecord = (await database.data?.get(modelId)) as { name?: string } | undefined;
  return modelRecord?.name;
}

async function lookupComponentInfo(
  modelId: DataId,
  geodeId: GeodeId | undefined,
): Promise<HoverComponentInfo | undefined> {
  const modelComponentsTable = database.model_components;
  if (geodeId === undefined || !modelComponentsTable) {
    return undefined;
  }
  const components = modelComponentsTable.where("[data_id+geode_id]");
  const query = components.equals([modelId, geodeId] as IndexableType);
  const component = (await query.first()) as
    | (Partial<GeodeIdentified> & { name?: string; type?: string })
    | undefined;
  if (!component) {
    return undefined;
  }
  return {
    name: component.name ?? "",
    id: component.geode_id ?? "",
    type: component.type ?? "",
  };
}

// Shared via createSharedComposable (rather than merged into the parent hybridViewer store) so sibling slices, e.g. ruler.ts and viewport.ts, can read hover state/clearHoverHighlight/hoverHighlight directly without importing the parent store and creating a cycle. A Pinia store would work too but its $id/$patch/... properties would leak into the composed store's spread and collapse its inferred type.
const useHybridViewerHighlight = createSharedComposable(() => {
  const is_hover_highlight = ref(false);
  const hover_highlight_field_type = ref<PickedFieldType>("CELL");
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
    onResponse: (response: ViewerHighlightResponse) => void | Promise<void>,
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

  async function handleHoverResponse(
    response: ViewerHighlightResponse,
    relativeMousePosition: { x: number; y: number },
  ): Promise<void> {
    if (
      !is_hover_highlight.value ||
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
    const modelName = await lookupModelName(response.id);
    const componentInfo = await lookupComponentInfo(response.id, response.geode_id);
    const newHoverData: HoverData = {
      modelId: response.id,
      modelName,
      blockName: response.geode_id,
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
  }

  const hoverHighlight = useDebounceFn((event: MouseEvent) => {
    const { genericRenderWindow } = useHybridViewerCore();
    const containerElement = genericRenderWindow.value?.getContainer();
    let relativeMousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
    if (containerElement) {
      relativeMousePosition = {
        x: event.clientX - containerElement.getBoundingClientRect().left,
        y: event.clientY - containerElement.getBoundingClientRect().top,
      };
    }
    requestHoverHighlight(event, async (response) => {
      await handleHoverResponse(response, relativeMousePosition);
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
