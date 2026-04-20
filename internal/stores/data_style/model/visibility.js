import { MESH_TYPES } from "@ogw_front/utils/default_styles";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const model_schemas = viewer_schemas.opengeodeweb_viewer.model;

async function getModelComponentsMap(modelId) {
  const dataStore = useDataStore();
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
  { componentStyleFunctions },
  ...args
) {
  const { componentsMap } = await getModelComponentsMap(modelId);

  const idsByComponent = {
    Block: [],
    Surface: [],
    Line: [],
    Corner: [],
  };

  for (const id of componentIds) {
    const type = componentsMap[id]?.type;
    if (type && idsByComponent[type]) {
      idsByComponent[type].push(id);
    }
  }

  const promises = [];
  if (action === "Visibility") {
    if (idsByComponent.Block.length > 0) {
      promises.push(
        componentStyleFunctions.Block.setModelBlocksVisibility(
          modelId,
          idsByComponent.Block,
          ...args,
        ),
      );
    }
    if (idsByComponent.Surface.length > 0) {
      promises.push(
        componentStyleFunctions.Surface.setModelSurfacesVisibility(
          modelId,
          idsByComponent.Surface,
          ...args,
        ),
      );
    }
    if (idsByComponent.Line.length > 0) {
      promises.push(
        componentStyleFunctions.Line.setModelLinesVisibility(modelId, idsByComponent.Line, ...args),
      );
    }
    if (idsByComponent.Corner.length > 0) {
      promises.push(
        componentStyleFunctions.Corner.setModelCornersVisibility(
          modelId,
          idsByComponent.Corner,
          ...args,
        ),
      );
    }
  } else if (action === "Color") {
    if (idsByComponent.Block.length > 0) {
      promises.push(
        componentStyleFunctions.Block.setModelBlocksColor(modelId, idsByComponent.Block, ...args),
      );
    }
    if (idsByComponent.Surface.length > 0) {
      promises.push(
        componentStyleFunctions.Surface.setModelSurfacesColor(
          modelId,
          idsByComponent.Surface,
          ...args,
        ),
      );
    }
    if (idsByComponent.Line.length > 0) {
      promises.push(
        componentStyleFunctions.Line.setModelLinesColor(modelId, idsByComponent.Line, ...args),
      );
    }
    if (idsByComponent.Corner.length > 0) {
      promises.push(
        componentStyleFunctions.Corner.setModelCornersColor(
          modelId,
          idsByComponent.Corner,
          ...args,
        ),
      );
    }
  }

  return Promise.all(promises);
}

function useModelVisibilityStyle(componentStyleFunctions) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const modelCommonStyle = useModelCommonStyle();

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
      const typeIds = componentIds.filter((id) => MESH_TYPES.includes(id));
      const individualIds = componentIds.filter((id) => !MESH_TYPES.includes(id));

      const promises = [];
      for (const typeId of typeIds) {
        promises.push(setModelComponentTypeVisibility(modelId, typeId, visibility));
      }

      if (individualIds.length > 0) {
        promises.push(
          dispatchToComponentTypes(
            modelId,
            individualIds,
            "Visibility",
            { componentStyleFunctions },
            visibility,
          ),
        );
      }
      return await Promise.all(promises);
    } finally {
      viewerStore.stop_request();
    }
  }

  async function setModelComponentTypeVisibility(modelId, componentType, visibility) {
    viewerStore.start_request();
    try {
      await modelCommonStyle.mutateModelComponentTypeStyle(modelId, componentType, {
        visibility,
      });
      const idsForType = await dataStore.getMeshComponentGeodeIds(modelId, componentType);
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

export { getModelComponentsMap, dispatchToComponentTypes, useModelVisibilityStyle };
