import { HOVER_DEBOUNCE_MS, HOVER_TIMEOUT_MS } from "./constants";
import { database } from "@ogw_internal/database/database.js";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

function useHybridViewerHighlight() {
  const is_hover_highlight = ref(false);
  const hover_highlight_field_type = ref("CELL");
  const hoverData = ref(undefined);
  const hoverPosition = ref({ x: 0, y: 0 });
  const hoverTimeoutRef = ref(undefined);
  const currentHoverId = ref(undefined);

  const clearHoverData = createClearHoverData(hoverTimeoutRef, hoverData, currentHoverId);

  const hoverHighlight = createHoverHighlight({ hoverTimeoutRef, currentHoverId, clearHoverData });

  function clearHoverHighlight() {
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

function performHoverHighlight(event, onResponse) {
  const hybridViewerStore = useHybridViewerStore();
  const { genericRenderWindow, hybridDb } = hybridViewerStore;
  const { is_hover_highlight, hover_highlight_field_type } = storeToRefs(hybridViewerStore);
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
  viewerStore.request({ schema, params }, { response_function: onResponse });
}

function performClearHoverHighlight() {
  const { hybridDb } = useHybridViewerStore();
  const { hover_highlight_field_type } = storeToRefs(useHybridViewerStore());
  const viewerStore = useViewerStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.highlight;
  const params = {
    x: -1,
    y: -1,
    field_type: hover_highlight_field_type.value,
    ids: Object.keys(hybridDb),
  };
  viewerStore.request({ schema, params });
}

function createClearHoverData(hoverTimeoutRef, hoverData, currentHoverId) {
  return function clearHoverData() {
    if (hoverTimeoutRef.value) {
      clearTimeout(hoverTimeoutRef.value);
      hoverTimeoutRef.value = undefined;
    }
    hoverData.value = undefined;
    currentHoverId.value = undefined;
  };
}

function createHoverHighlight({ hoverTimeoutRef, currentHoverId, clearHoverData }) {
  return useDebounceFn((event) => {
    const hybridViewerStore = useHybridViewerStore();
    const { genericRenderWindow } = hybridViewerStore;
    const { is_hover_highlight, hoverData, hoverPosition } = storeToRefs(hybridViewerStore);
    const containerElement = genericRenderWindow.value?.getContainer();
    const relativeMousePosition = containerElement
      ? {
          x: event.clientX - containerElement.getBoundingClientRect().left,
          y: event.clientY - containerElement.getBoundingClientRect().top,
        }
      : { x: event.clientX, y: event.clientY };

    performHoverHighlight(event, async (response) => {
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

      let componentInfo = undefined;
      let modelName = undefined;

      const modelRecord = await database.data.get(response.id);
      if (modelRecord) {
        modelName = modelRecord.name;
      }

      if (response.geode_id) {
        const components = database.model_components.where("[id+geode_id]");
        const query = components.equals([response.id, response.geode_id]);
        const component = await query.first();
        if (component) {
          componentInfo = {
            name: component.name,
            id: component.geode_id,
            type: component.type,
          };
        }
      }

      const newHoverData = {
        modelId: response.id,
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

export {
  createClearHoverData,
  createHoverHighlight,
  performClearHoverHighlight,
  performHoverHighlight,
  useHybridViewerHighlight,
};
