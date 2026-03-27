import { database } from "@ogw_internal/database/database";
import { liveQuery } from "dexie";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStateStore } from "@ogw_internal/stores/data_style/state";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelBlocksStyle } from "./blocks";
import { useModelCornersStyle } from "./corners";
import { useModelEdgesStyle } from "./edges";
import { useModelLinesStyle } from "./lines";
import { useModelPointsStyle } from "./points";
import { useModelSurfacesStyle } from "./surfaces";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const model_schemas = viewer_schemas.opengeodeweb_viewer.model;

const MESH_CONFIG = [{ type: "Corner" }, { type: "Line" }, { type: "Surface" }, { type: "Block" }];

const MESH_TYPES = MESH_CONFIG.map((config) => config.type);

export function useModelStyle() {
  const dataStore = useDataStore();
  const dataStyleStateStore = useDataStyleStateStore();
  const modelCornersStyleStore = useModelCornersStyle();
  const modelBlocksStyleStore = useModelBlocksStyle();
  const modelEdgesStyleStore = useModelEdgesStyle();
  const modelLinesStyleStore = useModelLinesStyle();
  const modelPointsStyleStore = useModelPointsStyle();
  const modelSurfacesStyleStore = useModelSurfacesStyle();
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();

  function buildSelection(modelId, components, stylesMap) {
    const componentsByType = Object.fromEntries(MESH_TYPES.map((type) => [type, []]));
    for (const component of components) {
      if (componentsByType[component.type]) {
        componentsByType[component.type].push(component);
      }
    }

    const groupStyles = dataStyleStateStore.getStyle(modelId);
    const selection = [];
    for (const type of MESH_TYPES) {
      const typeComponents = componentsByType[type];
      if (typeComponents.length === 0) {
        continue;
      }

      const typeKey = `${type.toLowerCase()}s`;
      const defaultVisibility = groupStyles[typeKey].visibility;

      let allVisible = true;
      for (const component of typeComponents) {
        const isVisible = stylesMap[component.geode_id]?.visibility ?? defaultVisibility;
        if (isVisible) {
          selection.push(component.geode_id);
        } else {
          allVisible = false;
        }
      }
      if (allVisible) {
        selection.push(type);
      }
    }
    return selection;
  }

  function modelVisibility(modelId) {
    return dataStyleStateStore.getStyle(modelId).visibility;
  }

  function setModelVisibility(modelId, visibility) {
    return viewerStore.request(
      model_schemas.visibility,
      { id: modelId, visibility },
      {
        response_function: async () => {
          await hybridViewerStore.setVisibility(modelId, visibility);
          await dataStyleStateStore.mutateStyle(modelId, { visibility });
          return { id: modelId, visibility };
        },
      },
    );
  }

  function visibleMeshComponents(id_ref) {
    const selection = ref([]);
    watch(
      () => unref(id_ref),
      (modelId, _prev, onCleanup) => {
        if (!modelId) {
          selection.value = [];
          return;
        }
        const observable = liveQuery(async () => {
          const allComponents = await database.model_components
            .where("id")
            .equals(modelId)
            .toArray();
          if (allComponents.length === 0) {
            return [];
          }
          const componentStyles = await database.model_component_datastyle
            .where("id_model")
            .equals(modelId)
            .toArray();
          const stylesMap = Object.fromEntries(
            componentStyles.map((style) => [style.id_component, style]),
          );
          return buildSelection(modelId, allComponents, stylesMap);
        });

        const subscription = observable.subscribe({
          next: (val) => {
            selection.value = val;
          },
        });
        onCleanup(() => subscription.unsubscribe());
      },
      { immediate: true },
    );
    return selection;
  }

  async function setModelComponentsVisibility(modelId, componentIds, visibility) {
    const allComponents = await database.model_components.where("id").equals(modelId).toArray();
    const componentsMap = Object.fromEntries(
      allComponents.map((component) => [component.geode_id, component]),
    );

    return Promise.all(
      MESH_TYPES.map(async (type) => {
        const typeComponents = allComponents.filter((component) => component.type === type);
        const isSelectedType = componentIds.includes(type);
        const idsToUpdate = isSelectedType
          ? typeComponents.map((component) => component.geode_id)
          : componentIds.filter((id) => componentsMap[id]?.type === type);

        if (idsToUpdate.length === 0) {
          return;
        }

        const viewerIds = await dataStore.getMeshComponentsViewerIds(modelId, idsToUpdate);
        if (viewerIds.length > 0) {
          const schema = model_schemas[`${type.toLowerCase()}s`].visibility;
          await viewerStore.request(schema, { id: modelId, block_ids: viewerIds, visibility });
        }
        return dataStyleStateStore.mutateComponentStyles(modelId, idsToUpdate, { visibility });
      }),
    );
  }

  async function setModelComponentsColor(modelId, componentIds, color) {
    const viewerIds = await dataStore.getMeshComponentsViewerIds(modelId, componentIds);
    if (viewerIds.length > 0) {
      await viewerStore.request(model_schemas.components_color, {
        id: modelId,
        block_ids: viewerIds,
        color,
      });
    }
    return dataStyleStateStore.mutateComponentStyles(modelId, componentIds, { color });
  }

  function applyModelStyle(modelId) {
    const style = dataStyleStateStore.getStyle(modelId);
    const handlers = {
      visibility: () => setModelVisibility(modelId, style.visibility),
      corners: () => modelCornersStyleStore.applyModelCornersStyle(modelId),
      lines: () => modelLinesStyleStore.applyModelLinesStyle(modelId),
      surfaces: () => modelSurfacesStyleStore.applyModelSurfacesStyle(modelId),
      blocks: () => modelBlocksStyleStore.applyModelBlocksStyle(modelId),
      points: () => modelPointsStyleStore.applyModelPointsStyle(modelId),
      edges: () => modelEdgesStyleStore.applyModelEdgesStyle(modelId),
    };

    return Promise.all(
      Object.keys(style)
        .filter((key) => handlers[key])
        .map((key) => handlers[key]()),
    );
  }

  function setModelMeshComponentsDefaultStyle(modelId) {
    return dataStore.item(modelId).then((item) => {
      if (!item) {
        return [];
      }
      const { mesh_components } = item;
      const handlers = {
        Corner: () => modelCornersStyleStore.setModelCornersDefaultStyle(modelId),
        Line: () => modelLinesStyleStore.setModelLinesDefaultStyle(modelId),
        Surface: () => modelSurfacesStyleStore.setModelSurfacesDefaultStyle(modelId),
        Block: () => modelBlocksStyleStore.setModelBlocksDefaultStyle(modelId),
      };
      return Promise.all(
        Object.keys(mesh_components)
          .filter((key) => handlers[key])
          .map((key) => handlers[key]()),
      );
    });
  }

  return {
    modelVisibility,
    visibleMeshComponents,
    setModelVisibility,
    setModelComponentsVisibility,
    setModelComponentsColor,
    applyModelStyle,
    setModelMeshComponentsDefaultStyle,
    ...useModelBlocksStyle(),
    ...useModelCornersStyle(),
    ...useModelEdgesStyle(),
    ...useModelLinesStyle(),
    ...useModelPointsStyle(),
    ...useModelSurfacesStyle(),
  };
}
