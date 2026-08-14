import { HOVER_DEBOUNCE_MS, HOVER_TIMEOUT_MS } from "./constants";
import { database } from "@ogw_internal/database/database.js";

function useHybridViewerHighlight(options) {
  const { genericRenderWindow, viewerStore, viewer_schemas, hybridDb } = options;

  const is_hover_highlight = ref(false);
  const hover_highlight_field_type = ref("CELL");
  const hoverData = ref(undefined);
  const hoverPosition = ref({ x: 0, y: 0 });
  const hoverTimeoutRef = ref(undefined);
  const currentHoverId = ref(undefined);

  const clearHoverData = createClearHoverData(hoverTimeoutRef, hoverData, currentHoverId);

  const hoverHighlight = createHoverHighlight({
    genericRenderWindow,
    is_hover_highlight,
    viewerStore,
    viewer_schemas,
    hover_highlight_field_type,
    hybridDb,
    hoverData,
    hoverPosition,
    currentHoverId,
    hoverTimeoutRef,
    clearHoverData,
  });

  function clearHoverHighlight() {
    clearHoverData();
    performClearHoverHighlight({
      viewerStore,
      viewer_schemas,
      hover_highlight_field_type,
      hybridDb,
    });
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

function performHoverHighlight(event, options) {
  const {
    is_hover_highlight,
    genericRenderWindow,
    viewerStore,
    viewer_schemas,
    hover_highlight_field_type,
    hybridDb,
    onResponse,
  } = options;
  if (!is_hover_highlight.value) {
    return;
  }
  const container = genericRenderWindow.getContainer();
  if (!container) {
    return;
  }
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

function performClearHoverHighlight(options) {
  const { viewerStore, viewer_schemas, hover_highlight_field_type, hybridDb } = options;
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

function createHoverHighlight(options) {
  const {
    genericRenderWindow,
    is_hover_highlight,
    viewerStore,
    viewer_schemas,
    hover_highlight_field_type,
    hybridDb,
    hoverData,
    hoverPosition,
    currentHoverId,
    hoverTimeoutRef,
    clearHoverData,
  } = options;

  return useDebounceFn((event) => {
    const containerElement = genericRenderWindow.value?.getContainer();
    let relativeMousePosition = { x: 0, y: 0 };
    if (containerElement) {
      const containerRect = containerElement.getBoundingClientRect();
      relativeMousePosition = {
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top,
      };
    } else {
      relativeMousePosition = { x: event.clientX, y: event.clientY };
    }

    performHoverHighlight(event, {
      is_hover_highlight,
      genericRenderWindow: genericRenderWindow.value,
      viewerStore,
      viewer_schemas,
      hover_highlight_field_type,
      hybridDb,
      onResponse: async (response) => {
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
          const component = await database.model_components
            .where("[id+geode_id]")
            .equals([response.id, response.geode_id])
            .first();
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
      },
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
