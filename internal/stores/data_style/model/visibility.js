import { MESH_TYPES } from "./constants";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
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
      return stores[type][`setModel${type}s${action}`](modelId, idsForType, ...args);
    }),
  );
}

function useModelVisibilityStyle(stores) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();

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

  async function setModelComponentTypeVisibility(modelId, type, visibility) {
    viewerStore.start_request();
    try {
      await dataStyleState.mutateModelComponentTypeStyle(modelId, type, {
        visibility,
      });
      const idsForType = await dataStore.getMeshComponentGeodeIds(modelId, type);
      if (idsForType.length === 0) {
        return;
      }
      await setModelComponentsVisibility(modelId, idsForType, visibility);
    } finally {
      viewerStore.stop_request();
    }
  }

  return {
    modelVisibility,
    setModelVisibility,
    setModelComponentsVisibility,
    setModelComponentTypeVisibility,
  };
}

function useModelComponentVisibility(type) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const viewerStore = useViewerStore();
  const schema = model_schemas[`${type.toLowerCase()}s`].visibility;

  return {
    [`setModel${type}sVisibility`]: (modelId, componentIds, visibility) =>
      dataStyleState.setModelTypeVisibility(modelId, componentIds, visibility, schema, {
        dataStore,
        viewerStore,
      }),
  };
}

export {
  getModelComponentsMap,
  dispatchToComponentTypes,
  useModelVisibilityStyle,
  useModelComponentVisibility,
};
