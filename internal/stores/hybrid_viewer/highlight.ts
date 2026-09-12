import { HOVER_DEBOUNCE_MS, HOVER_TIMEOUT_MS } from "./constants";
import { database } from "@ogw_internal/database/database.js";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import type { IndexableType } from "dexie";
import type { Ref } from "vue";
import type { HoverComponentInfo, HoverData, HybridViewerStorePublic } from "./vtk_types";

// The dynamic/RPC-shaped payload of the viewer's "highlight" schema response.
interface HighlightResponse {
  id?: string;
  picked_id?: number;
  field_type?: string;
  geode_id?: string;
  attributes?: Record<string, unknown>;
}

function createClearHoverData(
  hoverTimeoutRef: Ref<ReturnType<typeof setTimeout> | undefined>,
  hoverData: Ref<HoverData | undefined>,
  currentHoverId: Ref<string | undefined>,
) {
  return function clearHoverData(): void {
    if (hoverTimeoutRef.value) {
      clearTimeout(hoverTimeoutRef.value);
      hoverTimeoutRef.value = undefined;
    }
    hoverData.value = undefined;
    currentHoverId.value = undefined;
  };
}

function performHoverHighlight(
  event: MouseEvent,
  onResponse: (response: unknown) => void | Promise<void>,
): void {
  const hybridViewerStore = useHybridViewerStore();
  const { genericRenderWindow, hybridDb } = hybridViewerStore as unknown as HybridViewerStorePublic;
  const { is_hover_highlight, hover_highlight_field_type } = storeToRefs(
    hybridViewerStore,
  ) as unknown as { is_hover_highlight: Ref<boolean>; hover_highlight_field_type: Ref<string> };
  if (!is_hover_highlight.value) {
    return;
  }
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
  viewerStore.request(
    {
      schema,
      params,
    },
    {
      response_function: onResponse,
    },
  );
}

interface CreateHoverHighlightParams {
  hoverTimeoutRef: Ref<ReturnType<typeof setTimeout> | undefined>;
  currentHoverId: Ref<string | undefined>;
  clearHoverData: () => void;
}

function createHoverHighlight({
  hoverTimeoutRef,
  currentHoverId,
  clearHoverData,
}: CreateHoverHighlightParams) {
  return useDebounceFn((event: MouseEvent) => {
    const hybridViewerStore = useHybridViewerStore();
    const { genericRenderWindow } = hybridViewerStore as unknown as HybridViewerStorePublic;
    const { is_hover_highlight, hoverData, hoverPosition } = storeToRefs(
      hybridViewerStore,
    ) as unknown as {
      is_hover_highlight: Ref<boolean>;
      hoverData: Ref<HoverData | undefined>;
      hoverPosition: Ref<{ x: number; y: number }>;
    };
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
    performHoverHighlight(event, async (rawResponse: unknown) => {
      const response = rawResponse as HighlightResponse | undefined;
      const isResponseValid =
        response && response.id && response.picked_id !== undefined && response.picked_id !== -1;
      if (!is_hover_highlight.value || !isResponseValid) {
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
      const modelRecord = (await database.data?.get(response.id as string)) as
        | { name?: string }
        | undefined;
      if (modelRecord) {
        modelName = modelRecord.name;
      }
      const modelComponentsTable = database.model_components;
      if (response.geode_id && modelComponentsTable) {
        const components = modelComponentsTable.where("[id+geode_id]");
        const query = components.equals([
          response.id as string,
          response.geode_id,
        ] as IndexableType);
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
        modelId: response.id as string,
        modelName,
        blockName: response.geode_id,
        pickedId: response.picked_id,
        fieldType: response.field_type,
        component: componentInfo,
        attributes: response.attributes || {},
      };
      hoverTimeoutRef.value = setTimeout(() => {
        hoverPosition.value = relativeMousePosition;
        hoverData.value = newHoverData;
        hoverTimeoutRef.value = undefined;
      }, HOVER_TIMEOUT_MS);
    });
  }, HOVER_DEBOUNCE_MS);
}
function performClearHoverHighlight(): void {
  const hybridViewerStore = useHybridViewerStore();
  const { hybridDb } = hybridViewerStore as unknown as HybridViewerStorePublic;
  const { hover_highlight_field_type } = storeToRefs(hybridViewerStore) as unknown as {
    hover_highlight_field_type: Ref<string>;
  };
  const viewerStore = useViewerStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.highlight;
  const params = {
    x: -1,
    y: -1,
    field_type: hover_highlight_field_type.value,
    ids: Object.keys(hybridDb),
  };
  viewerStore.request({
    schema,
    params,
  });
}

function useHybridViewerHighlight() {
  const is_hover_highlight = ref(false);
  const hover_highlight_field_type = ref("CELL");
  const hoverData = ref<HoverData | undefined>(undefined);
  const hoverPosition = ref({
    x: 0,
    y: 0,
  });
  const hoverTimeoutRef = ref<ReturnType<typeof setTimeout> | undefined>(undefined);
  const currentHoverId = ref<string | undefined>(undefined);
  const clearHoverData = createClearHoverData(hoverTimeoutRef, hoverData, currentHoverId);
  const hoverHighlight = createHoverHighlight({
    hoverTimeoutRef,
    currentHoverId,
    clearHoverData,
  });

  function clearHoverHighlight(): void {
    clearHoverData();
    performClearHoverHighlight();
  }

  return {
    is_hover_highlight,
    hover_highlight_field_type,
    hoverData,
    hoverPosition,
    clearHoverHighlight,
    hoverHighlight,
  };
}

export {
  createClearHoverData,
  createHoverHighlight,
  performClearHoverHighlight,
  performHoverHighlight,
  useHybridViewerHighlight,
};
