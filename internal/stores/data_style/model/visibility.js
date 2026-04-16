import { MESH_TYPES } from "./constants";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelBlocksStyle } from "./blocks";
import { useModelCornersStyle } from "./corners";
import { useModelLinesStyle } from "./lines";
import { useModelSurfacesStyle } from "./surfaces";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const model_schemas = viewer_schemas.opengeodeweb_viewer.model;

async function getModelComponentsMap(modelId, dataStore) {
  const results = await Promise.all(
    MESH_TYPES.map(async (type) => {
      const geodeIds = await dataStore.getMeshComponentGeodeIds(modelId, type);
      return geodeIds.map((geode_id) => ({ geode_id, type }));
    }),
  );
  const allComponents = results.flat();
  return {
    allComponents,
    componentsMap: Object.fromEntries(
      allComponents.map((component) => [component.geode_id, component]),
    ),
  };
}

async function dispatchToComponentTypes(
  modelId,
  componentIds,
  action,
  { dataStore, stores },
  ...args
) {
  const { componentsMap } = await getModelComponentsMap(modelId, dataStore);

  return Promise.all(
    MESH_TYPES.map((type) => {
      const idsForType = componentIds.filter((id) => componentsMap[id]?.type === type);
      if (idsForType.length === 0) {
        return undefined;
      }
      const handlerName = `setModel${type}s${action}`;
      return stores[type][handlerName](modelId, idsForType, ...args);
    }),
  );
}

function useModelVisibilityStyle() {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();

  const stores = {
    Corner: useModelCornersStyle(),
    Line: useModelLinesStyle(),
    Surface: useModelSurfacesStyle(),
    Block: useModelBlocksStyle(),
  };

  function modelVisibility(modelId) {
    return dataStyleState.getStyle(modelId).visibility;
  }

  function setModelVisibility(modelId, visibility) {
    return viewerStore.request(
      model_schemas.visibility,
      { id: modelId, visibility },
      {
        response_function: async () => {
          await hybridViewerStore.setVisibility(modelId, visibility);
          await dataStyleState.mutateStyle(modelId, { visibility });
          return { id: modelId, visibility };
        },
      },
    );
  }

  async function setModelComponentsVisibility(modelId, componentIds, visibility) {
    viewerStore.start_request();
    try {
      return await dispatchToComponentTypes(
        modelId,
        componentIds,
        "Visibility",
        { dataStore, stores, viewerStore },
        visibility,
      );
    } finally {
      viewerStore.stop_request();
    }
  }

  return {
    modelVisibility,
    setModelVisibility,
    setModelComponentsVisibility,
  };
}

export { getModelComponentsMap, dispatchToComponentTypes, useModelVisibilityStyle };
